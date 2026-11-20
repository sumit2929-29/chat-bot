import { ApiError } from "../utils/apiError.js";
import { supabaseRequest } from "../utils/supabase.js";
import type { CrawledPage, KnowledgeDocument } from "../types/index.js";

interface CrawlResult {
  url: string;
  path: string;
  title: string;
  description: string;
  cleanText: string;
}

export class CrawlerService {
  /**
   * SSRF Protection: Ensure the target URL is a safe, publicly routable HTTP/HTTPS address.
   */
  static validateSafeUrl(rawUrl: string): URL {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    } catch {
      throw new ApiError(400, "INVALID_URL", "Please provide a valid website URL.");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new ApiError(400, "INVALID_PROTOCOL", "Only HTTP and HTTPS protocols are allowed.");
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost, link-local, loopback, private RFC1918 and cloud metadata IPs
    const forbiddenPatterns = [
      /^localhost$/i,
      /^127\.\d+\.\d+\.\d+$/,
      /^0\.0\.0\.0$/,
      /^10\.\d+\.\d+\.\d+$/,
      /^192\.168\.\d+\.\d+$/,
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
      /^169\.254\.\d+\.\d+$/, // Link-local & cloud metadata
      /^::1$/,
      /^fc00:/i,
      /^fe80:/i,
    ];

    if (forbiddenPatterns.some((pattern) => pattern.test(host))) {
      throw new ApiError(400, "FORBIDDEN_HOST", "Internal and private network addresses cannot be crawled.");
    }

    return parsed;
  }

  /**
   * Fetch an HTML page with timeout and standard user agent
   */
  static async fetchHtml(url: string, timeoutMs = 8000): Promise<string> {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SupportAI-Crawler/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      return await response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ApiError(502, "FETCH_FAILED", `Failed to reach ${url}: ${msg}`);
    }
  }

  /**
   * Clean HTML to extract title, description, and plain readable text.
   */
  static extractPageData(html: string, pageUrl: string): CrawlResult {
    const parsed = new URL(pageUrl);

    // 1. Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsed.hostname;

    // 2. Extract meta description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : "";

    // 3. Strip non-content tags: scripts, styles, svgs, header, nav, footer, noscript
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ");

    // 4. Strip all HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, " ");

    // 5. Decode basic HTML entities
    cleaned = cleaned
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");

    // 6. Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Cap at 20,000 characters per page to prevent massive memory usage
    const cleanText = cleaned.slice(0, 20000);

    return {
      url: pageUrl,
      path: parsed.pathname || "/",
      title,
      description,
      cleanText,
    };
  }

  /**
   * Find internal links within the same domain
   */
  static extractInternalLinks(html: string, baseUrl: URL, maxLinks = 15): string[] {
    const linkMatches = html.matchAll(/href=["']([^"']+)["']/gi);
    const discovered = new Set<string>();

    for (const match of linkMatches) {
      const href = match[1].trim();
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        continue;
      }

      try {
        const resolved = new URL(href, baseUrl.origin);
        // Only same hostname and http/https
        if (resolved.hostname === baseUrl.hostname && ["http:", "https:"].includes(resolved.protocol)) {
          // Normalize path: ignore query params or hashes for page indexing
          const cleanLink = `${resolved.origin}${resolved.pathname.replace(/\/$/, "")}`;
          // Ignore binary/asset files
          if (!cleanLink.match(/\.(png|jpg|jpeg|gif|svg|pdf|zip|css|js|woff2?|ico|xml)$/i)) {
            discovered.add(cleanLink || resolved.origin);
          }
        }
      } catch {
        // ignore invalid urls
      }

      if (discovered.size >= maxLinks) break;
    }

    return Array.from(discovered);
  }

  /**
   * Crawl a website starting from its homepage up to maxPages (default 8)
   */
  static async crawlWebsite(websiteId: string, targetUrl: string, maxPages = 8): Promise<CrawlResult[]> {
    const rootUrl = this.validateSafeUrl(targetUrl);
    const queue: string[] = [rootUrl.href];
    const visited = new Set<string>();
    const results: CrawlResult[] = [];

    while (queue.length > 0 && results.length < maxPages) {
      const currentUrl = queue.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      try {
        const html = await this.fetchHtml(currentUrl);
        const pageData = this.extractPageData(html, currentUrl);

        if (pageData.cleanText.length > 30) {
          results.push(pageData);

          // Save page to Supabase crawled_pages
          try {
            await supabaseRequest<CrawledPage>("crawled_pages", {
              method: "POST",
              prefer: "resolution=merge-duplicates",
              body: {
                website_id: websiteId,
                url: pageData.url,
                path: pageData.path,
                title: pageData.title,
                description: pageData.description,
                clean_text: pageData.cleanText,
                status: "crawled",
              },
            });

            // Also index as knowledge document for Gemini RAG
            await supabaseRequest<KnowledgeDocument>("knowledge_documents", {
              method: "POST",
              prefer: "return=representation",
              body: {
                website_id: websiteId,
                title: pageData.title || `Page ${pageData.path}`,
                source_type: "crawled_page",
                source_url: pageData.url,
                content: `Title: ${pageData.title}\nURL: ${pageData.url}\nSummary: ${pageData.description}\n\nContent:\n${pageData.cleanText}`,
              },
            });
          } catch (dbErr) {
            console.error(`[Crawler] Failed to save page ${currentUrl} to database:`, dbErr);
          }

          // Discover more links if we still need more pages
          if (results.length < maxPages) {
            const internalLinks = this.extractInternalLinks(html, rootUrl, maxPages * 2);
            for (const link of internalLinks) {
              if (!visited.has(link) && !queue.includes(link)) {
                queue.push(link);
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[Crawler] Skipping ${currentUrl} due to error:`, err);
      }
    }

    return results;
  }
}

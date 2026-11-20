export interface DetectedTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl?: string;
  brandName?: string;
}

export class ThemeDetectorService {
  /**
   * Analyzes raw HTML to extract brand colors, favicon/logo, fonts, and brand name.
   */
  static extractTheme(html: string, baseUrl: URL): DetectedTheme {
    // 1. Extract Brand Name
    const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let brandName = ogSiteName ? ogSiteName[1].trim() : "";
    if (!brandName && titleMatch) {
      // Often titles are "MyBrand - Tagline" or "MyBrand | Fast Delivery"
      const cleanTitle = titleMatch[1].split(/[-–—|:]/)[0].trim();
      brandName = cleanTitle.length > 2 && cleanTitle.length < 30 ? cleanTitle : baseUrl.hostname;
    }
    if (!brandName) brandName = baseUrl.hostname;

    // 2. Extract Logo or Favicon
    let logoUrl: string | undefined;
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const appleIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
    const iconMatch =
      html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

    const rawIcon = appleIcon?.[1] || ogImage?.[1] || iconMatch?.[1];
    if (rawIcon) {
      try {
        logoUrl = new URL(rawIcon, baseUrl.origin).href;
      } catch {
        // invalid URL
      }
    }
    if (!logoUrl) {
      // Default standard favicon fallback
      logoUrl = `${baseUrl.origin}/favicon.ico`;
    }

    // 3. Extract Theme Colors
    let primaryColor = "#0F172A"; // Default slate-900
    let secondaryColor = "#3B82F6"; // Default blue-500

    const metaThemeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (metaThemeColor && this.isValidHexColor(metaThemeColor[1].trim())) {
      primaryColor = metaThemeColor[1].trim();
    } else {
      // Look for prominent hex colors in inline styles or css variables
      const hexColors = Array.from(html.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)).map((m) => m[0].toUpperCase());
      // Filter out pure black, pure white, and pure grays
      const vibrantColors = hexColors.filter((hex) => {
        const clean = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
        return !["#FFFFFF", "#000000", "#F8FAFC", "#F1F5F9", "#E2E8F0", "#333333", "#CCCCCC"].includes(clean);
      });

      if (vibrantColors.length > 0) {
        primaryColor = vibrantColors[0];
        if (vibrantColors.length > 1 && vibrantColors[1] !== vibrantColors[0]) {
          secondaryColor = vibrantColors[1];
        }
      }
    }

    // 4. Extract Font Family
    let fontFamily = "Inter, system-ui, sans-serif";
    const fontMatch = html.match(/font-family:\s*["']?([a-zA-Z0-9\s,-]+)["']?[;}]/i);
    if (fontMatch && fontMatch[1].length < 40) {
      fontFamily = `${fontMatch[1].trim()}, sans-serif`;
    }

    return {
      primaryColor,
      secondaryColor,
      backgroundColor: "#FFFFFF",
      textColor: "#1E293B",
      fontFamily,
      logoUrl,
      brandName,
    };
  }

  private static isValidHexColor(hex: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
  }
}

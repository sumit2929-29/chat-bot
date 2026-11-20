import { env } from "../config/env.js";
import { ApiError } from "./apiError.js";

interface SupabaseRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
  timeoutMs?: number;
}

/**
 * Lightweight, direct PostgREST client for Supabase.
 * Executes server-side queries via HTTP using the SUPABASE_SERVICE_ROLE_KEY.
 */
export async function supabaseRequest<T>(
  resource: string,
  options: SupabaseRequestOptions = {}
): Promise<T> {
  const { url, serviceRoleKey } = env.supabase;
  const timeoutMs = options.timeoutMs ?? 10000;

  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/${resource}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ApiError(503, "DATABASE_UNAVAILABLE", "The database is temporarily unreachable.");
  }

  if (!response.ok) {
    // Sanitize response to prevent leaking internal database schemas or table details
    throw new ApiError(503, "DATABASE_ERROR", "The database operation failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(503, "DATABASE_ERROR", "The database returned an unexpected response.");
  }
}

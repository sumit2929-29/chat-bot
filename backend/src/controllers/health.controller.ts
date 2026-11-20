import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

/**
 * Health Controller
 * Provides deployment verification and dependency status checks.
 */
export class HealthController {
  static async checkHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, serviceRoleKey } = env.supabase;
      let databaseStatus: "ok" | "unavailable" = "unavailable";

      // Lightweight probe to Supabase PostgREST
      try {
        const probe = await fetch(`${url}/rest/v1/clients?select=id&limit=0`, {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          signal: AbortSignal.timeout(5000),
        });
        if (probe.ok) {
          databaseStatus = "ok";
        }
      } catch {
        databaseStatus = "unavailable";
      }

      const isHealthy = databaseStatus === "ok";
      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? "ok" : "degraded",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: databaseStatus,
        gemini: env.gemini.isConfigured ? "configured" : "not_configured",
      });
    } catch (error) {
      next(error);
    }
  }
}

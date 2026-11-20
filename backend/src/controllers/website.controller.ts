import type { Request, Response, NextFunction } from "express";
import { WebsiteService } from "../services/website.service.js";

export class WebsiteController {
  /**
   * POST /api/websites
   * Add a new website -> triggers theme detection & crawl
   */
  static async createWebsite(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, name } = req.body;
      const clerkUserId = (req as any).auth?.userId || req.headers["x-user-id"];
      const userEmail = (req as any).auth?.sessionClaims?.email || req.headers["x-user-email"];

      const userId = await WebsiteService.getOrCreateUserId(
        typeof clerkUserId === "string" ? clerkUserId : undefined,
        typeof userEmail === "string" ? userEmail : undefined
      );

      const result = await WebsiteService.createWebsite({
        userId,
        name,
        url,
      });

      res.status(201).json({
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/websites
   * List websites for current user
   */
  static async listWebsites(req: Request, res: Response, next: NextFunction) {
    try {
      const clerkUserId = (req as any).auth?.userId || req.headers["x-user-id"];
      const userId = await WebsiteService.getOrCreateUserId(
        typeof clerkUserId === "string" ? clerkUserId : undefined
      );

      const websites = await WebsiteService.listWebsites(userId);
      res.status(200).json({ data: websites });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/websites/:id
   * Get single website details, pages, knowledge, config
   */
  static async getWebsiteDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const details = await WebsiteService.getWebsiteDetails(id);
      res.status(200).json({ data: details });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/websites/:id/chatbot
   * Update chatbot customization
   */
  static async updateChatbotConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const updated = await WebsiteService.updateChatbotConfig(id, req.body);
      res.status(200).json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/websites/:id/knowledge
   * Add manual knowledge or FAQ
   */
  static async addKnowledgeDoc(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { title, content, sourceType } = req.body;
      const doc = await WebsiteService.addKnowledgeDoc(id, { title, content, sourceType });
      res.status(201).json({ data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/websites/:id/recrawl
   * Trigger a re-crawl of the website
   */
  static async recrawlWebsite(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const count = await WebsiteService.recrawlWebsite(id);
      res.status(200).json({ message: "Re-crawled successfully.", pagesCrawled: count });
    } catch (err) {
      next(err);
    }
  }
}

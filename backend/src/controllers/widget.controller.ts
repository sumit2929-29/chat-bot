import type { Request, Response, NextFunction } from "express";
import { WidgetService } from "../services/widget.service.js";

export class WidgetController {
  /**
   * GET /api/widget/:publicId/config
   * Returns branding, welcome message, colors and suggested questions
   */
  static async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const publicId = String(req.params.publicId);
      const data = await WidgetService.getPublicConfig(publicId);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/widget/:publicId/session
   * Starts a new visitor session
   */
  static async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const publicId = String(req.params.publicId);
      const { visitorId } = req.body;
      const session = await WidgetService.startVisitorSession(publicId, visitorId);
      res.status(200).json({ data: session });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/widget/:publicId/message
   * Answers visitor question grounded in the website knowledge base
   */
  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const publicId = String(req.params.publicId);
      const { message, conversationId } = req.body;
      const result = await WidgetService.handleVisitorMessage({
        publicChatbotId: publicId,
        message,
        conversationId,
      });
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

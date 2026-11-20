import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { ChatService } from "../services/chat.service.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Chat Controller
 * Endpoints for sending messages and fetching conversation history.
 */
export class ChatController {
  static async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.sessionContext;
      if (!session) {
        throw new ApiError(401, "UNAUTHORIZED", "Active session required.");
      }

      const { conversation_id, message } = req.body || {};

      // Ensure requested conversation_id matches the authenticated session
      if (conversation_id && conversation_id !== session.id) {
        throw new ApiError(403, "CONVERSATION_FORBIDDEN", "You do not have access to this conversation.");
      }

      const result = await ChatService.sendMessage(session, message);

      res.status(200).json({
        reply: result.reply,
        message_id: result.messageId,
        timestamp: result.timestamp,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.sessionContext;
      if (!session) {
        throw new ApiError(401, "UNAUTHORIZED", "Active session required.");
      }

      const requestedConvId = req.query.conversation_id as string | undefined;
      if (requestedConvId && requestedConvId !== session.id) {
        throw new ApiError(403, "CONVERSATION_FORBIDDEN", "You do not have access to this conversation.");
      }

      const result = await ChatService.getHistory(session, req.query.limit, req.query.offset);

      res.status(200).json({
        conversation_id: result.conversationId,
        messages: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}


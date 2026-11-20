import { Router } from "express";
import { WidgetController } from "../controllers/widget.controller.js";

export const widgetRouter = Router();

// Public widget endpoints accessed by embed scripts on third-party websites
widgetRouter.get("/:publicId/config", WidgetController.getConfig);
widgetRouter.post("/:publicId/session", WidgetController.startSession);
widgetRouter.post("/:publicId/message", WidgetController.sendMessage);

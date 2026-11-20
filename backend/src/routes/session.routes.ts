import { Router } from "express";
import { SessionController } from "../controllers/session.controller.js";

export const sessionRouter = Router();

// POST /api/session/start
sessionRouter.post("/start", SessionController.startSession);


import { Router } from "express";
import { getConfigHandler, updateConfigHandler } from "../controllers/config.controller.js";

export const configRouter = Router();

configRouter.get("/", getConfigHandler);
configRouter.post("/", updateConfigHandler);


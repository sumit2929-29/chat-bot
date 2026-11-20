import { Router } from "express";
import { WebsiteController } from "../controllers/website.controller.js";

export const websiteRouter = Router();

// Website CRUD & Management
websiteRouter.post("/", WebsiteController.createWebsite);
websiteRouter.get("/", WebsiteController.listWebsites);
websiteRouter.get("/:id", WebsiteController.getWebsiteDetails);
websiteRouter.patch("/:id/chatbot", WebsiteController.updateChatbotConfig);
websiteRouter.post("/:id/knowledge", WebsiteController.addKnowledgeDoc);
websiteRouter.post("/:id/recrawl", WebsiteController.recrawlWebsite);

import { Request, Response } from "express";

// Default bot configuration state (can be persisted or updated via admin dashboard)
let currentConfig = {
  assistantName: "Aura",
  theme: "dark",
  mode: "CUSTOM_QUESTIONS",
  unlockChatAfter: 1,
  requireLeadCapture: true,
  askEmail: true,
  askPhone: false,
};

let currentQuestions = [
  { id: "q1", text: "How does the platform pricing work?", answer: "Our SaaS tiers start at $29/mo." },
  { id: "q2", text: "What services do you provide?", answer: "We provide AI automation, client support chatbots, and cloud engineering." },
];

export async function getConfigHandler(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    config: currentConfig,
    questions: currentQuestions,
  });
}

export async function updateConfigHandler(req: Request, res: Response): Promise<void> {
  const { config, questions } = req.body;

  if (config && typeof config === "object") {
    currentConfig = { ...currentConfig, ...config };
  }

  if (Array.isArray(questions)) {
    currentQuestions = questions;
  }

  res.status(200).json({
    success: true,
    message: "Configuration updated successfully.",
    config: currentConfig,
    questions: currentQuestions,
  });
}


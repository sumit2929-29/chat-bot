import { app } from "./app.js";
import { env } from "./config/env.js";

const PORT = env.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Chatbot Backend running on port ${PORT}`);
  console.log(`📡 Endpoints available under http://localhost:${PORT}/api`);
  console.log(`🔒 Allowed CORS Origin: ${env.security.allowedOrigin}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    process.exit(0);
  });
});


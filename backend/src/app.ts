import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export const app = express();

// Security HTTP headers (configured to allow cross-origin widget embeds)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration: Allow official frontend, plus public access for /api/widget endpoints
const allowedOrigins = new Set([
  env.security.allowedOrigin,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!incomingOrigin) return callback(null, true);

      // Chatbot widget and public APIs can be called from third-party client websites
      if (allowedOrigins.has(incomingOrigin) || env.security.allowedOrigin === "*") {
        return callback(null, true);
      }

      // Default allow for widget embeds
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-user-id", "x-user-email"],
    maxAge: 600,
  })
);

// Body parsers & Cookie parser
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Disable x-powered-by header
app.disable("x-powered-by");

// Serve static assets (such as standalone widget.js)
app.use(express.static("public"));

// Mount API routes
app.use("/api", apiRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "The requested endpoint does not exist.",
    },
  });
});

// Centralized error handler
app.use(errorHandler);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const authRouter = require("./src/routes/authRoutes");
const messageRouter = require("./src/routes/messageRoutes");
const userInfoRouter = require("./src/routes/userInfoRoutes");
const isAuthMiddleware = require("./src/middleware/authMiddleware");
const connectToDb = require("./src/config/db");

const app = express();

const url = process.env.DB_URL;

connectToDb(url)
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// ─── Rate limiter (auth only) ──────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Server is running" }));

// 🔒 Rate-limited auth routes
app.use("/api", authRouter);

app.use("/api/message", isAuthMiddleware, messageRouter);
app.use("/api/user", isAuthMiddleware, userInfoRouter);

// Health check — shows Redis + DB status
app.get("/api/health", async (req, res) => {
  const { getPubClient } = require("./src/config/redis");
  const redisClient = getPubClient();

  const health = {
    status: "ok",
    uptime: Math.floor(process.uptime()) + "s",
    redis: redisClient?.status === "ready" ? "connected" : "disconnected",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  };

  const statusCode =
    health.redis === "connected" && health.database === "connected" ? 200 : 503;
  return res.status(statusCode).json(health);
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});


app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? "Something went wrong" : err.message,
  });
});

module.exports = app;
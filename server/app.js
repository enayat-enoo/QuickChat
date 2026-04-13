const express = require("express");
const app = express();
const authRouter = require("./src/routes/authRoutes");
const messageRouter = require("./src/routes/messageRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToDb = require("./src/config/db");
const userInfoRouter = require("./src/routes/userInfoRoutes");
const isAuthMiddleware = require("./src/middleware/authMiddleware");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const url = process.env.DB_URL;

connectToDb(url)
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

//middlewares
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
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: "Too many attempts, please try again after 15 minutes." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

//routes
app.get("/",(req, res) => res.json({ message: "Server is running" }));
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
      require("mongoose").connection.readyState === 1
        ? "connected"
        : "disconnected",
  };

  const statusCode =
    health.redis === "connected" && health.database === "connected" ? 200 : 503;
  return res.status(statusCode).json(health);
});

//Global Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;

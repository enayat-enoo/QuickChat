require("dotenv").config();

const app = require("./app");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");

const messageSocket = require("./src/sockets/chatSocket");
const callSocket = require("./src/sockets/callSocket");
const { connectRedis,disconnectRedis } = require("./src/config/redis");
const socketAuthMiddleware = require("./src/middleware/socketAuthMiddleware");

const server = createServer(app);
const PORT = process.env.PORT || 8000;

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Defensive timeout — even if connectRedis() has no internal timeout,
// this guarantees the server still starts in Redis-down mode.
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    if (timer.unref) timer.unref();
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function startServer() {
  try {
    const { pubClient, subClient } = await withTimeout(
      connectRedis(),
      5000,
      "connectRedis",
    );
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO Redis adapter attached");
  } catch (err) {
    console.warn("Redis unavailable, running without adapter:", err.message);
    console.warn("For production scaling, ensure REDIS_URL is set.");
  }

  socketAuthMiddleware(io);
  messageSocket(io);
  callSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Graceful shutdown — Docker/PM2 send SIGTERM
async function shutdown(signal) {
  console.log(`${signal} received — shutting down`);
  try { await disconnectRedis(); } catch {}
  io.close(() => server.close(() => process.exit(0)));
  const t = setTimeout(() => process.exit(1), 10_000);
  if (t.unref) t.unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
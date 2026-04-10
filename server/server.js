const app = require("./app");
const messageSocket = require("./src/sockets/chatSocket");
const callSocket = require("./src/sockets/callSocket");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { connectRedis } = require("./src/config/redis");
const socketAuthMiddleware = require("./src/middleware/socketAuthMiddleware");

const server = createServer(app);
const PORT = process.env.PORT || 8000;

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

async function startServer() {
  try {
    // Connect Redis and attach the adapter
    const { pubClient, subClient } = await connectRedis();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO Redis adapter attached");
  } catch (err) {
    // Redis is optional in development — app still works without it
    console.warn("Redis unavailable, running without adapter:", err.message);
    console.warn("For production scaling, ensure REDIS_URL is set.");
  }

  // Auth middleware runs before any socket events
  socketAuthMiddleware(io);

  // Register socket handlers
  messageSocket(io);
  callSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

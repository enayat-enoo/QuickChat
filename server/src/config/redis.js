const { createClient } = require("ioredis").default || require("ioredis");

let pubClient = null;
let subClient = null;

async function connectRedis() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  pubClient = new (require("ioredis"))(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      // Retry with exponential backoff, max 30 seconds
      return Math.min(times * 500, 30000);
    },
  });

  subClient = pubClient.duplicate();

  pubClient.on("connect", () => console.log("Redis pub client connected"));
  pubClient.on("error", (err) => console.error("Redis pub error:", err.message));
  subClient.on("error", (err) => console.error("Redis sub error:", err.message));

  // Wait for both clients to be ready
  await Promise.all([
    new Promise((resolve) => pubClient.once("ready", resolve)),
    new Promise((resolve) => subClient.once("ready", resolve)),
  ]);

  return { pubClient, subClient };
}

function getPubClient() { return pubClient; }
function getSubClient() { return subClient; }

module.exports = { connectRedis, getPubClient, getSubClient };
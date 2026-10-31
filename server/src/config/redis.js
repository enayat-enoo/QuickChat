const Redis = require("ioredis");

let pubClient = null;
let subClient = null;

const CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000);

async function connectRedis() {
  const redisUrl = process.env.REDIS_URL;

  // Scenario A: REDIS_URL is empty — skip Redis entirely
  if (!redisUrl) {
    console.log(
      "REDIS_URL not set — running without Redis adapter (Scenario A monolith mode)",
    );
    throw new Error("REDIS_URL not set");
  }

  pubClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      return Math.min(times * 500, 30000);
    },
  });

  subClient = pubClient.duplicate();

  pubClient.on("connect", () => console.log("Redis pub client connected"));
  pubClient.on("error", (err) => console.error("Redis pub error:", err.message));
  subClient.on("error", (err) => console.error("Redis sub error:", err.message));

  // 🔒 Wait for "ready" but NEVER hang forever.
  // ioredis keeps retrying in the background via retryStrategy, so if Redis
  // comes back later, the adapter will start working — we just don't block boot.
  const waitReady = (client, label) =>
    new Promise((resolve, reject) => {
      if (client.status === "ready") return resolve();

      let timer = setTimeout(() => {
        cleanup();
        reject(new Error(`${label} not ready after ${CONNECT_TIMEOUT_MS}ms`));
      }, CONNECT_TIMEOUT_MS);
      if (timer.unref) timer.unref();

      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        clearTimeout(timer);
        client.removeListener("ready", onReady);
        client.removeListener("error", onError);
      };

      client.once("ready", onReady);
      client.once("error", onError);
    });

  try {
    await Promise.all([
      waitReady(pubClient, "pubClient"),
      waitReady(subClient, "subClient"),
    ]);
  } catch (err) {
    // Don't leak clients on failure — but leave them retrying in the background
    // so a later Redis recovery still reconnects. The caller decides whether
    // to run without the adapter.
    throw err;
  }

  return { pubClient, subClient };
}

function getPubClient() { return pubClient; }
function getSubClient() { return subClient; }

// 🔒 Called from graceful shutdown
async function disconnectRedis() {
  const clients = [pubClient, subClient].filter(Boolean);
  await Promise.all(
    clients.map((c) =>
      c.quit().catch(() => {
        // If quit fails, force-disconnect
        try { c.disconnect(); } catch {}
      }),
    ),
  );
}

module.exports = {
  connectRedis,
  disconnectRedis,
  getPubClient,
  getSubClient,
};
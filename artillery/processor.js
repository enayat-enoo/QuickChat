/**
 * processor.js — Artillery custom functions for QuickChat Socket.IO test
 * 
 * Artillery calls these as beforeScenario / custom functions.
 * Each virtual user runs connectAndChat() which handles the full
 * login → connect → send → disconnect lifecycle.
 */

const http = require("http");
const { io: SocketIOClient } = require("socket.io-client");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost";
const PASSWORD = "Test@1234";
const MESSAGES_PER_USER = parseInt(process.env.MESSAGES_PER_USER || "5", 10);
const MESSAGE_INTERVAL_MS = parseInt(process.env.MESSAGE_INTERVAL_MS || "1000", 10);

// Load users.json — resolve relative to this file's location
let users = [];
const USERS_FILE = path.resolve(__dirname, "users.json");
try {
  users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  console.log(`[processor] Loaded ${users.length} test users from ${USERS_FILE}`);
} catch (e) {
  console.error(`[processor] Could not load ${USERS_FILE} — run seed-users.js first`);
}

function pickPair() {
  const idx = Math.floor(Math.random() * users.length);
  const sender = users[idx];
  const receiver = users[(idx + 1) % users.length];
  return { sender, receiver };
}

function loginHttp(email, password) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ email, password });
    const url = new URL("/api/login", BASE_URL);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          if (res.statusCode !== 201) {
            return reject(new Error(`Login failed ${res.statusCode}: ${raw}`));
          }
          const setCookie = res.headers["set-cookie"] || [];
          const tokenCookie = setCookie.find((c) => c.startsWith("token="));
          if (!tokenCookie) return reject(new Error("No token cookie in response"));
          resolve(tokenCookie.split(";")[0]); // "token=eyJ..."
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Main function — called by Artillery as a custom function scenario step
function connectAndChat(context, events, done) {
  if (users.length < 2) {
    events.emit("error", new Error("Not enough users — run seed-users.js first"));
    return done();
  }

  const { sender, receiver } = pickPair();

  loginHttp(sender.email, PASSWORD)
    .then((cookieStr) => {
      const socket = SocketIOClient(BASE_URL, {
        transports: ["websocket"],
        extraHeaders: { cookie: cookieStr },
        reconnection: false,
        timeout: 10000,
      });

      let connected = false;
      let sent = 0;
      let acked = 0;
      let interval = null;

      function finish() {
        if (interval) clearInterval(interval);
        if (connected) socket.disconnect();
        done();
      }

      socket.on("connect_error", (err) => {
        events.emit("counter", "socket.connect_error", 1);
        finish();
      });

      socket.on("connect", () => {
        connected = true;
        events.emit("counter", "socket.connected", 1);

        interval = setInterval(() => {
          if (sent >= MESSAGES_PER_USER) {
            clearInterval(interval);
            interval = null;
            // Give 5s for acks then finish
            setTimeout(finish, 5000);
            return;
          }

          const clientSentAt = Date.now();
          socket.emit("sendMessage", {
            chatId: receiver.userId,
            receiverId: receiver.userId,
            content: `load-test msg ${sent + 1} from ${sender.username}`,
            clientSentAt,
          });
          sent++;
          events.emit("counter", "messages.sent", 1);
        }, MESSAGE_INTERVAL_MS);
      });

      socket.on("messageSent", (msg) => {
        acked++;
        events.emit("counter", "messages.acked", 1);

        if (msg._timing) {
          const rtt = Date.now() - (msg._timing.clientSentAt || Date.now());
          events.emit("histogram", "rtt_ms", rtt);
          events.emit("histogram", "db_write_ms", msg._timing.dbWriteMs);
          events.emit("histogram", "redis_emit_ms", msg._timing.redisEmitMs);
          events.emit("histogram", "server_total_ms", msg._timing.totalServerMs);
          if (msg._timing.crossNode) events.emit("counter", "messages.cross_node", 1);
        }
      });

      socket.on("disconnect", () => { connected = false; });

      // Hard timeout
      setTimeout(finish, 60000);
    })
    .catch((err) => {
      events.emit("counter", "login.failed", 1);
      done();
    });
}

module.exports = { connectAndChat };
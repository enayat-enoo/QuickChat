const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost";
const USER_COUNT = parseInt(process.env.USER_COUNT || "50", 10);
const PASSWORD = "Test@1234";

function post(path_, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(path_, BASE_URL);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          ...extraHeaders,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw), headers: res.headers }); }
          catch { resolve({ status: res.statusCode, body: raw, headers: res.headers }); }
        });
      },
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`Seeding ${USER_COUNT} users at ${BASE_URL}...`);
  const users = [];

  for (let i = 0; i < USER_COUNT; i++) {
    const email = `test${i}@quickchat.dev`;
    const username = `testuser${i}`;
    const name = `Test User ${i}`;
    const fakeIp = `10.0.${Math.floor(i / 255)}.${i % 255 + 1}`;
    const headers = { "X-Forwarded-For": fakeIp };

    const reg = await post("/api/register", { name, username, email, password: PASSWORD }, headers);
    if (reg.status !== 200 && reg.status !== 409) {
      console.error(`  ✗ register ${email}: ${reg.status}`, reg.body);
      continue;
    }

    const login = await post("/api/login", { email, password: PASSWORD }, headers);
    if (login.status !== 201) {
      console.error(`  ✗ login ${email}: ${login.status}`, login.body);
      continue;
    }

    users.push({ email, username, password: PASSWORD, userId: login.body.user._id });
    process.stdout.write(`  ✓ ${email} (${login.body.user._id})\n`);
  }

  // Write to same directory as this script (artillery/)
  const outPath = path.join(__dirname, "users.json");
  fs.writeFileSync(outPath, JSON.stringify(users, null, 2));
  console.log(`\nDone. ${users.length} users written to ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });

const fs = require("fs");
const path = require("path");

// Resolve metrics dir relative to project root, not this file's location
const METRICS_DIR = path.resolve(__dirname, "../../../../metrics");

// One CSV file per process start — filename encodes scenario + timestamp
// e.g. metrics/scenario-B_2025-05-24T10-30-00.csv
let csvStream = null;
let rowCount = 0;
const SCENARIO = process.env.SCENARIO || "unknown"; // set via env: SCENARIO=A or SCENARIO=B
const NODE_ID = process.env.NODE_ID || process.pid.toString();

const CSV_HEADER =
  "timestamp,scenario,nodeId,messageId,chatId," +
  "serverReceiveMs,dbWriteMs,redisEmitMs,totalServerMs," +
  "contentLength,crossNode\n";

function getStream() {
  if (csvStream) return csvStream;

  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `scenario-${SCENARIO}_node-${NODE_ID}_${ts}.csv`;
  const filepath = path.join(METRICS_DIR, filename);

  csvStream = fs.createWriteStream(filepath, { flags: "a" });
  csvStream.write(CSV_HEADER);

  console.log(`[metrics] Writing to ${filepath}`);
  return csvStream;
}

/**
 * Log one message-delivery event.
 *
 * @param {object} opts
 * @param {string}  opts.messageId       - MongoDB _id of the message
 * @param {string}  opts.chatId          - chatId
 * @param {number}  opts.serverReceiveMs - Date.now() when sendMessage fired
 * @param {number}  opts.dbWriteMs       - ms taken for messageModel.create()
 * @param {number}  opts.redisEmitMs     - ms taken for socket.to().emit()
 * @param {number}  opts.totalServerMs   - total server processing time
 * @param {number}  opts.contentLength   - message content char length
 * @param {boolean} opts.crossNode       - true when sender nodeId !== receiver nodeId
 *                                         (detected via Redis adapter serverCount)
 */
function logMetric(opts) {
  const stream = getStream();
  const row = [
    new Date().toISOString(),
    SCENARIO,
    NODE_ID,
    opts.messageId,
    opts.chatId,
    opts.serverReceiveMs,
    opts.dbWriteMs.toFixed(2),
    opts.redisEmitMs.toFixed(2),
    opts.totalServerMs.toFixed(2),
    opts.contentLength,
    opts.crossNode ? 1 : 0,
  ].join(",");

  stream.write(row + "\n");
  rowCount++;

  // Flush every 100 rows so data survives a crash mid-test
  if (rowCount % 100 === 0) {
    stream.cork();
    process.nextTick(() => stream.uncork());
  }
}

// Gracefully close the stream on process exit
process.on("exit", () => { if (csvStream) csvStream.end(); });
process.on("SIGINT", () => { if (csvStream) csvStream.end(); process.exit(); });
process.on("SIGTERM", () => { if (csvStream) csvStream.end(); process.exit(); });

module.exports = { logMetric };
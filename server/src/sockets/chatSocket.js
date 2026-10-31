const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");
const { logMetric } = require("../utils/metricsLogger");
const { assertParticipant } = require("../utils/assertParticipant");

// NODE_ID identifies which instance handled a message in the CSV.
// Set via env (e.g. NODE_ID=1 in docker-compose) so it survives PM2 clustering.
const NODE_ID = process.env.NODE_ID || process.pid.toString();

async function messageSocket(io) {
  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    socket.join(userId);

    // Mark user online
    try {
      await userModel.findByIdAndUpdate(
        userId,
        { isOnline: true },
        { new: true },
      );
      io.emit("userOnline", { userId });
    } catch (error) {
      console.error("Error marking user online:", error);
    }

    // ─── Handle incoming message ────────────────────────────────────────────
    socket.on("sendMessage", async ({ chatId, content, receiverId, clientSentAt }) => {
      // ① Capture server receive time immediately — before any async work
      const serverReceiveAt = Date.now();

      try {
        if (!chatId || !content?.trim() || !receiverId) return;
        if (content.length > 2000) return;

        //Authorization: sender must belong to the chat.
        // Also derive the receiver from chat.participants — never trust client.
        const chat = await assertParticipant(chatId, userId);
        const otherParticipant = chat.participants.find(
          (p) => p.toString() !== userId.toString(),
        );
        if (!otherParticipant || otherParticipant.toString() !== receiverId.toString()) {
          socket.emit("messageError", { message: "Invalid receiver for this chat" });
          return;
        }

        // ─── DB write ────────────────────────────────────────────────────────
        const dbStart = Date.now();

        let message = await messageModel.create({
          sender: userId,
          receiver: otherParticipant,
          content: content.trim(),
          chatId,
        });

        message = await message.populate("sender", "username avatar name");

        const dbWriteMs = Date.now() - dbStart;

        // Update chat's lastMessage + increment receiver's unread count
        // Fire-and-forget — don't block message delivery on this
        chatModel.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: Date.now(),
          $inc: { [`participantInfo.${otherParticipant}.unreadCount`]: 1 },
        }).catch((err) => console.error("chatModel update error:", err));

        // ─── Redis emit ──────────────────────────────────────────────────────
        const emitStart = Date.now();

        // socket.to(receiverId) goes through the Redis adapter when running
        // in cluster mode — this is the "Redis hop" we are measuring.
        socket.to(otherParticipant.toString()).emit("getMessage", message);

        const redisEmitMs = Date.now() - emitStart;

        // ─── Total server processing time ───────────────────────────────────
        const totalServerMs = Date.now() - serverReceiveAt;

        // ─── Cross-node detection ────────────────────────────────────────────
        const serverCount = io.of("/").adapter.serverCount ?? 1;
        const crossNode = serverCount > 1;

        // ─── Emit confirmation back to sender ───────────────────────────────
        socket.emit("messageSent", {
          ...message.toObject(),
          _timing: {
            nodeId: NODE_ID,
            serverReceiveAt,
            clientSentAt: clientSentAt || null,
            dbWriteMs,
            redisEmitMs,
            totalServerMs,
            crossNode,
          },
        });

        // ─── Write to CSV ────────────────────────────────────────────────────
        // Kept outside the delivery path: a CSV failure must not report
        // "send failed" for a message that was already delivered.
        try {
          logMetric({
            messageId: message._id.toString(),
            chatId,
            serverReceiveMs: serverReceiveAt,
            dbWriteMs,
            redisEmitMs,
            totalServerMs,
            contentLength: content.trim().length,
            crossNode,
          });
        } catch (metricErr) {
          console.error("logMetric failed:", metricErr);
        }
      } catch (error) {
        console.error("sendMessage socket error:", error);
        socket.emit("messageError", { message: "Failed to send message" });
      }
    });

    // Reset unread count when user opens a chat
    socket.on("markRead", async ({ chatId }) => {
      try {
        if (!chatId) return;
        // 🔒 Authorization: caller must belong to the chat
        await assertParticipant(chatId, userId);
        await chatModel.findByIdAndUpdate(chatId, {
          $set: { [`participantInfo.${userId}.unreadCount`]: 0 },
        });
      } catch (error) {
        console.error("markRead error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      const timer = setTimeout(async () => {
        try {
          // Scoped to this user's room — adapter-native, far cheaper than
          // enumerating every socket on every node.
          const sockets = await io.in(userId).fetchSockets();
          const stillConnected = sockets.length > 0;

          if (!stillConnected) {
            const updatedUser = await userModel.findByIdAndUpdate(
              userId,
              { isOnline: false, lastSeen: new Date() },
              { new: true },
            );
            io.emit("userOffline", {
              userId,
              lastSeen: updatedUser.lastSeen,
            });
          }
        } catch (error) {
          console.error("Error marking user offline:", error);
        }
      }, 3000);
      if (timer.unref) timer.unref();
    });
  });
}

module.exports = messageSocket;
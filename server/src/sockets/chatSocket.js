const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");

async function messageSocket(io) {
  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    socket.join(userId);

    // Mark user online
    try {
      await userModel.findByIdAndUpdate(userId, { isOnline: true }, { new: true });
      io.emit("userOnline", { userId });
    } catch (error) {
      console.error("Error marking user online:", error);
    }

    // Handle incoming message
    socket.on("sendMessage", async ({ chatId, content, receiverId }) => {
      try {
        if (!chatId || !content?.trim() || !receiverId) return;
        if (content.length > 2000) return;

        // Write to DB once
        let message = await messageModel.create({
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
          chatId,
        });

        message = await message.populate("sender", "username avatar name");

        // Update chat's lastMessage + increment receiver's unread count
        await chatModel.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: Date.now(),
          $inc: { [`participantInfo.${receiverId}.unreadCount`]: 1 },
        });

        // Emit to receiver
        socket.to(receiverId).emit("getMessage", message);

        // Emit back to sender to confirm (replaces optimistic message with real DB record)
        socket.emit("messageSent", message);

      } catch (error) {
        console.error("sendMessage socket error:", error);
        socket.emit("messageError", { message: "Failed to send message" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      setTimeout(async () => {
        try {
          const sockets = await io.fetchSockets();
          const stillConnected = sockets.some((s) => s.user?.id === userId);

          if (!stillConnected) {
            const updatedUser = await userModel.findByIdAndUpdate(
              userId,
              { isOnline: false, lastSeen: new Date() },
              { new: true }
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
    });
  });
}

module.exports = messageSocket;
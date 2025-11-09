const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");
async function messageSocket(io) {
  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    console.log(`User ${userId} connected`);
    socket.join(userId);
    try {
      await userModel.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("userOnline", { userId });
    } catch (error) {
      console.log("Error while marking the user online", error);
    }
    socket.on("sendMessage", async ({ chatId, content, receiverId }) => {
      try {
        const message = await messageModel.create({
          sender: userId,
          receiver: receiverId,
          content : content,
          chatId : chatId
        });
        await chatModel.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: Date.now(),
        });
        io.to(receiverId).emit("getMessage", message);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", async () => {
      //wait for few seconds in case of reconnection
      try {
        setTimeout(async () => {
          const sockets = await io.fetchSockets();
          const stillConnected = sockets.some((s) => s.user.id === userId);

          if (!stillConnected) {
            await userModel.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: new Date(),
            });
            io.emit("userOffline", { userId });
          }
        }, 3000);
      } catch (error) {
        console.error("Error marking user offline:", error);
      }
    });
  });
}

module.exports = messageSocket;

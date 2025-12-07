const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");
async function messageSocket(io) {
  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    socket.join(userId);
    try {
      await userModel.findByIdAndUpdate(userId, { isOnline: true },{new:true});
      io.emit("userOnline", { userId });
    } catch (error) {
      console.log("Error while marking the user online", error);
    }
    socket.on("sendMessage", async ({ chatId, content, receiverId }) => {
      try {
        let message = await messageModel.create({
          sender: userId,
          receiver: receiverId,
          content : content,
          chatId : chatId
        });

        message = await message.populate("sender", "username avatar name");

        await chatModel.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: Date.now(),
        });
        socket.to(receiverId).emit("getMessage", message);
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

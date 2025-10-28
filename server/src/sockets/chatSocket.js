const messageModel = require("../models/Message");
const userModel = require("../models/User");
async function messageSocket(io) {
  io.on("connection", async (socket) => {
    console.log(`Socket Id ${socket.id}`);
    const userId = socket.user.id;
    try {
      await userModel.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("userOnline", { userId });
    } catch (error) {
      console.log("Error while marking the user online", error);
    }
    socket.join(userId);
    socket.on("sendMessage", async ({ content, receiverId }) => {
      const senderId = userId;
      try {
        const message = await messageModel.create({
          sender: senderId,
          receiver: receiverId,
          content: content,
        });
        io.to(senderId).emit("getMessage", message);
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

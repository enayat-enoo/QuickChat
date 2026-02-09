async function callSocket(io) {
  io.on("connection", async (socket) => {
    const myId = socket.user.id;
    socket.join(myId);
    socket.on(
      "CALL_INITIATE",
      async ({ toUserId, callType, name, avatar, sdp }) => {
        socket.to(toUserId).emit("CALL_INCOMING", {
          fromUserId: myId,
          callType,
          name,
          avatar,
          sdp,
        });
      },
    );
    socket.on("ICE_CANDIDATE", async ({ toUserId, candidate }) => {
      socket
        .to(toUserId)
        .emit("ICE_CANDIDATE", { fromUserId: myId, candidate });
    });
    socket.on("CALL_ACCEPTED", async ({ toUserId, sdp }) => {
      socket.to(toUserId).emit("CALL_ACCEPTED", { fromUserId: myId, sdp });
    });
    socket.on("CALL_DROP", async ({ toUserId }) => {
      socket.to(toUserId).emit("CALL_DROP", { fromUserId: myId });
    });
  });
}

module.exports = callSocket;

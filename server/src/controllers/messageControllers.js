const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");

//send message handler
// Kept as a stub — actual message sending happens via socket
// This route is intentionally disabled to prevent duplicate DB writes
async function sendMessage(req, res) {
  return res.status(410).json({
    message: "Use the socket 'sendMessage' event to send messages.",
  });
}

//retrive message handler
async function getMessage(req, res) {
  const chatId = req.query.chatId;
  try {
    const message = await messageModel
      .find({ chatId })
      .populate("sender", "name username avatar")
      .populate("receiver", "name username avatar")
      .sort({ createdAt: 1 });
    return res.status(200).json({
      message: "message fetched successfully",
      data: message,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getChats(req, res) {
  const userId = req.user.id;
  try {
    const chatList = await chatModel
      .find({
        participants: { $in: [userId] },
      })
      .populate("participants", "name username avatar isOnline lastSeen")
      .populate("lastMessage", "content createdAt")
      .sort({ updateAt: -1 });
    return res
      .status(200)
      .json({ message: "chats fetched successfully", data: chatList });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  sendMessage,
  getMessage,
  getChats,
};

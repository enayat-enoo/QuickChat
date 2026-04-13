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
  const { chatId, cursor, limit = 50 } = req.query;

  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  try {
    const query = { chatId };

    // If cursor exists, only fetch messages older than that message's timestamp
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await messageModel
      .find(query)
      .populate("sender", "name username avatar")
      .populate("receiver", "name username avatar")
      .sort({ createdAt: -1 }) // newest first
      .limit(Number(limit));

    // Reverse so oldest-first order is restored for the UI
    const ordered = messages.reverse();

    // Tell client if there are more messages to load above
    const hasMore = messages.length === Number(limit);

    return res.status(200).json({
      message: "messages fetched successfully",
      data: ordered,
      hasMore,
      // next cursor = timestamp of the oldest message in this batch
      nextCursor: ordered.length > 0 ? ordered[0].createdAt : null,
    });
  } catch (error) {
    console.error(error);
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
      .sort({ updatedAt: -1 });
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

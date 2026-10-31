const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");
const { assertParticipant } = require("../utils/assertParticipant");

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
  const { chatId, cursor } = req.query;

  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  // Validate + clamp limit
  let limit = Number(req.query.limit ?? 50);
  if (!Number.isFinite(limit) || limit < 1) limit = 50;
  if (limit > 100) limit = 100;

  try {
    // 🔒 Authorization: caller must belong to the chat
    await assertParticipant(chatId, req.user.id);

    const query = { chatId };

    // If cursor exists, only fetch messages older than that message's timestamp
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (Number.isNaN(cursorDate.getTime())) {
        return res.status(400).json({ message: "invalid cursor" });
      }
      query.createdAt = { $lt: cursorDate };
    }

    // Fetch one extra to know if there is another page
    const messages = await messageModel
      .find(query)
      .populate("sender", "name username avatar")
      .populate("receiver", "name username avatar")
      .sort({ createdAt: -1 }) // newest first
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    const ordered = page.reverse(); // restore oldest-first for the UI

    return res.status(200).json({
      message: "messages fetched successfully",
      data: ordered,
      hasMore,
      // next cursor = timestamp of the oldest message in this batch
      nextCursor: ordered.length > 0 ? ordered[0].createdAt : null,
    });
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ message: "Access denied" });
    }
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
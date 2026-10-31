const chatModel = require("../models/ChatModel");
async function assertParticipant(chatId, userId) {
  const chat = await chatModel
    .findOne({ _id: chatId, participants: userId })
    .lean();

  if (!chat) {
    const err = new Error("Chat not found or access denied");
    err.status = 403;
    throw err;
  }
  return chat;
}

module.exports = { assertParticipant };
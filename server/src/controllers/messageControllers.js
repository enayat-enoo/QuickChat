const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");

//send message handler
async function sendMessage(req, res) {
  const senderId = req.user.id;
  const { id, message } = req.body;
  if (!id || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const receiverIdVerification = await userModel.findById(id);
  if (!receiverIdVerification) {
    return res.status(404).json({ message: "Invalid Receiver" });
  }

  try {
    let chat = await chatModel.findOne({
      participants: { $all: [senderId, id] },
    });
    if (!chat) {
      chat = await chatModel.create({
        participants: [senderId, id],
        lastMessage: null,
        participantInfo: {
          [senderId]: { unreadCount: 0 },
          [id]: { unreadCount: 1 },
        },
      });
    }
    const messageFromDb = await messageModel.create({
      sender: senderId,
      receiver: id,
      content: message,
      chatId: chat._id,
    });
    chat.lastMessage = messageFromDb._id;
    await chat.save();
    return res.status(200).json({ message: "message sent", data: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "some error has occurred" });
  }
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
      .populate("participants", "name username avatar isOnline")
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

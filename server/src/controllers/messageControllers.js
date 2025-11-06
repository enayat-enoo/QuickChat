const messageModel = require("../models/Message");
const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");

//send message handler
async function sendMessage(req, res) {
  const senderId = req.user.id;
  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const receiverIdVerification = await userModel.findById(receiverId);
  if (!receiverIdVerification) {
    return res.status(404).json({ message: "Invalid Receiver" });
  }

  try {
    let chat = await chatModel.findOne({
      participantInfo: { $all: [senderId, receiverId] },
    });
    if (!chat) {
      chat = await chatModel.create({
        participants: [senderId, receiverId],
        lastMessage: content,
        participantInfo: {
          [senderId]: { unreadCount: 0 },
          [receiverId]: { unreadCount: 1 },
        },
      });
    }
    const message = await messageModel.create({
      sender: senderId,
      receiver: receiverId,
      content: content,
      chatId: chat._id,
    });
    chat.lastMessage = message._id;
    await chat.save();
    return res.status(200).json({ message: "message sent", data: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "some error has occurred" });
  }
}

//retrive message handler
async function getMessage(req, res) {
  const chatId = req.chatId;
  try {
    const message = await messageModel({ chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar")
      .exec();
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
      .populate("participants", "name username avatar")
      .populate("lastmessage")
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

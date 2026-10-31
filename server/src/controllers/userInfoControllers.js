const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");
const uploadImage = require("../config/cloudinary");
const { assertParticipant } = require("../utils/assertParticipant");

async function getUserInfo(req, res) {
  const userId = req.user.id;
  try {
    const userInformation = await userModel.findById(userId);
    // 🔒 Check null BEFORE dereferencing
    if (!userInformation) {
      return res.status(404).json({ message: "user not found" });
    }
    const data = {
      _id: userInformation._id,
      id: userInformation._id,
      name: userInformation.name,
      username: userInformation.username,
      avatar: userInformation.avatar,
      bio: userInformation.bio,
    };
    return res.status(200).json({ message: "user found", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getSearchedUserInfo(req, res) {
  const user = req.query.username;
  if (!user) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const userInformation = await userModel.findOne({ username: user });
    if (!userInformation) {
      return res.status(404).json({ message: "user not found" });
    }

    // 🔒 No self-chat
    if (userInformation._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "cannot search yourself" });
    }

    // 🔒 $size: 2 so this never matches a future group chat
    let userData = await chatModel
      .findOne({
        participants: { $all: [req.user.id, userInformation._id], $size: 2 },
      })
      .populate("participants", "name username avatar isOnline lastSeen");

    if (!userData) {
      userData = await chatModel.create({
        participants: [req.user.id, userInformation._id],
        lastMessage: null,
        // 🔒 Both participants start at unreadCount 0 — no ghost badge
        participantInfo: {
          [req.user.id]: { unreadCount: 0 },
          [userInformation._id]: { unreadCount: 0 },
        },
      });
      userData = await userData.populate(
        "participants",
        "name username avatar isOnline lastSeen",
      );
    }

    return res.status(200).json({ message: "user found", data: userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getUserInfoByChatId(req, res) {
  const chatId = req.query.chatId;
  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }
  try {
    // 🔒 Caller must belong to the chat
    await assertParticipant(chatId, req.user.id);

    const receiverInformation = await chatModel
      .findById(chatId)
      // 🔒 Explicit projection — never return the whole user doc
      .populate("participants", "name username avatar isOnline lastSeen");

    return res.status(200).json({ data: receiverInformation });
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ message: "Access denied" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function uploadAvatar(req, res) {
  // 🔒 Respond when no file is sent, instead of hanging
  if (!req.file) {
    return res.status(400).json({ message: "no file uploaded" });
  }
  try {
    const result = await uploadImage(req.file.buffer);
    await userModel.findByIdAndUpdate(req.user.id, { avatar: result.url });
    return res
      .status(200)
      .json({ message: "Avatar uploaded successfully", avatar: result.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  getUserInfo,
  getSearchedUserInfo,
  getUserInfoByChatId,
  uploadAvatar,
};
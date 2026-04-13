const userModel = require("../models/User");
const chatModel = require("../models/ChatModel");
const uploadImage = require("../config/cloudinary");
async function getUserInfo(req, res) {
  const userId = req.user.id;
  try {
    const userInformation = await userModel.findById(userId);
    const data = {
      _id: userInformation._id,
      id: userInformation._id,
      name: userInformation.name,
      username: userInformation.username,
      avatar: userInformation.avatar,
      bio: userInformation.bio,
    };
    if (!userInformation) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ message: "user found", data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getSearchedUserInfo(req, res) {
  const user = req.query.username;
  if (!user) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  let userData;
  try {
    const userInformation = await userModel.findOne({ username: user });
    if (!userInformation) {
      return res.status(404).json({ message: "user not found" });
    }
    userData = await chatModel
      .findOne({
        participants: { $all: [req.user.id, userInformation._id] },
      })
      .populate("participants", "name username avatar isOnline lastSeen");
    if (!userData) {
      userData = await chatModel.create({
        participants: [req.user.id, userInformation._id],
        lastMessage: null,
        participantInfo: {
          [req.user.id]: { unreadCount: 0 },
          [userInformation._id]: { unreadCount: 1 },
        },
      });
      userData = await userData.populate(
        "participants",
        "name username avatar isOnline lastSeen",
      );
    }
    return res.status(200).json({ message: "user found", data: userData });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getUserInfoByChatId(req, res) {
  const chatId = req.query.chatId;
  try {
    const receiverInformation = await chatModel
      .findById(chatId)
      .populate("participants");
    return res.status(200).json({ data: receiverInformation });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function uploadAvatar(req, res) {
  //upload avatar to cloudinary if exists
  if (req.file) {
    try {
      const result = await uploadImage(req.file.buffer);
      //update user avatar in db
      await userModel.findByIdAndUpdate(req.user.id, {
        avatar: result.url,
      });
      return res
        .status(200)
        .json({ message: "Avatar uploaded successfully", avatar: result.url });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = {
  getUserInfo,
  getSearchedUserInfo,
  getUserInfoByChatId,
  uploadAvatar,
};

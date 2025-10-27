const messageModel = require("../models/Message");
const userModel = require("../models/User");

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
    const message = await messageModel.create({
      sender: senderId,
      receiver: receiverId,
      content: content,
    });
    return res.status(200).json({ message: "message sent", data: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "some error has occurred" });
  }
}

//retrive message handler
async function getMessage(req, res) {
  const senderId = req.user.id;
  const receiverId = req.params.id;
  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID required" });
  }

  try {
    const messages = await messageModel
      .find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      })
      .sort({ createdAt: 1 });
    return res
      .status(200)
      .json({ message: "messages retrived", data: messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "some error has occurred" });
  }
}

module.exports = {
  sendMessage,
  getMessage,
};
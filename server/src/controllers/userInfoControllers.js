const userModel = require("../models/User");

async function getUserInfo(req, res) {
  const userId = req.user.id;
  try {
    const userInformation = await userModel.findById(userId);
    const data = {
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

module.exports = getUserInfo;

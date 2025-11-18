const express = require("express");
const userInfoRouter = express.Router();
const { getUserInfo, getSearchedUserInfo, getUserInfoByChatId ,uploadAvatar}= require("../controllers/userInfoControllers");
const upload = require("../config/multerConfig");

userInfoRouter.get("/", getUserInfo);
userInfoRouter.get("/search", getSearchedUserInfo);
userInfoRouter.get("/searchById",getUserInfoByChatId);
userInfoRouter.post("/avatar", upload.single("avatar"), uploadAvatar);

module.exports = userInfoRouter;
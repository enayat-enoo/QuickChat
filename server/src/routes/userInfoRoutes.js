const express = require("express");
const userInfoRouter = express.Router();
const { getUserInfo, getSearchedUserInfo, getUserInfoByChatId}= require("../controllers/userInfoControllers");

userInfoRouter.get("/", getUserInfo);
userInfoRouter.get("/search", getSearchedUserInfo);
userInfoRouter.get("/searchById",getUserInfoByChatId);

module.exports = userInfoRouter;
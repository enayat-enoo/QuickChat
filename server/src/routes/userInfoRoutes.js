const express = require("express");
const userInfoRouter = express.Router();
const { getUserInfo, getSearchedUserInfo}= require("../controllers/userInfoControllers");

userInfoRouter.get("/", getUserInfo);
userInfoRouter.get("/search", getSearchedUserInfo);

module.exports = userInfoRouter;
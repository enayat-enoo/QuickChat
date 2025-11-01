const express = require("express");
const userInfoRouter = express.Router();
const getUserInfo= require("../controllers/userInfoControllers");

userInfoRouter.get("/", getUserInfo);

module.exports = userInfoRouter;
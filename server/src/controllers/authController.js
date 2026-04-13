const userModel = require("../models/User");
const { tokenGenerator } = require("../utils/generateToken");
const {
  hashPassword,
  hashedPasswordVerifier,
} = require("../utils/passwordHash");
const uploadImage = require("../config/cloudinary");
const { validateRequest } = require("../middleware/validationMiddleware");

const saltRounds = Number(process.env.SALT_ROUNDS || 10);

//User Registration Handler Function
async function userRegistration(req, res) {
  const validationError = validateRequest(req, res);
  if (validationError) return;
  const { name, username, email, password } = req.body;
  const user = await userModel.findOne({ username });
  if (user) {
    return res.status(409).json({ message: "user conflict" });
  }

  //upload avatar to cloudinary if exists
  if (req.file) {
    try {
      const result = await uploadImage(req.file.buffer);
      req.body.avatar = result.url;
    } catch (error) {
      console.log(error);
    }
  }
  //hash password
  const hashedPassword = await hashPassword(password, saltRounds);

  try {
    const userId = await userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      avatar: req.body.avatar || null,
    });
    return res
      .status(200)
      .json({ message: "registration sucessfull", data: userId });
  } catch (error) {
    return res.status(400).json({ message: "some error has ocurred" });
  }
}

//Login Handler Function
async function login(req, res) {
  const validationError = validateRequest(req, res);
  if (validationError) return;
  const { email, password } = req.body;
  try {
    const findUser = await userModel.findOne({ email });
    if (!findUser) {
      return res.status(404).json({ message: "no such user exists" });
    }

    const isMatch = await hashedPasswordVerifier(password, findUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const payload = {
      id: findUser._id,
      username: findUser.username,
    };

    const token = await tokenGenerator(payload);

    return res
      .cookie("token", token, {
        httpOnly: true,
        // secure: false,
        secure: true,
        // sameSite: "lax",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "login successful",
        user: {
          _id: findUser._id,
          id: findUser._id,
          username: findUser.username,
          name: findUser.name,
          avatar: findUser.avatar,
        },
      });
  } catch (error) {
    return res.status(500).json({ message: "server Error" });
  }
}

//Logout Handler function
async function logout(req, res) {
  return res
    .clearCookie("token", {
      httpOnly: true,
      // secure: false,
      secure: true,
      // sameSite: "lax",
      sameSite: "none",
    })
    .status(200)
    .json({ message: "logout successful" });
}

module.exports = {
  userRegistration,
  login,
  logout,
};

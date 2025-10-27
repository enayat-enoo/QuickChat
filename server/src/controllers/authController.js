const User = require("../models/User");
const { tokenGenerator } = require("../utils/generateToken");
const {
  hashPassword,
  hashedPasswordVerifier,
} = require("../utils/passwordHash");

const secretKey = process.env.SECRET_KEY;
const saltRounds = process.env.SALT_ROUNDS;

//User Registration Handler Function
async function userRegistration(req, res) {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({
      message: "missing required fields",
    });
  }
  const user = await User.findOne({ username });
  if (user) {
    return res.status(409).json({ message: "user conflict" });
  }

  const hashedPassword = await hashPassword(password, saltRounds);

  try {
    const userId = await User.create({
      name,
      username,
      email,
      password: hashPassword,
    });
    return res.status(200).json({ message: "registration sucessfull" });
  } catch (error) {
    return res.status(400).json({ message: "some error has ocurred" });
  }
}

//Login Handler Function
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(409).json({ message: "invalid input" });
  }
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(404).json({ message: "no such user exists" });
    }

    const isMatch = await hashedPasswordVerifier(password, findUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const payload = {
      id: findUser._id,
      name: findUser.name,
      username: findUser.username,
      email: findUser.email,
    };

    const token = await tokenGenerator(payload, secretKey);

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        samesite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        //for localhost
        //secure : false,
        //samsite : "lax"
      })
      .status(201)
      .json({ message: "login successful" });
  } catch (error) {
    return res.status(500).json({ message: "server Error" });
  }
}

//Logout Handler function
async function logout(req,res){
    return res.clearCookie("token",{
        httpOnly : true,
        secure : true,
        samesite : "none",
        //for localhost
        secure : false,
        samesite : lax
    })
}

module.exports = {
  userRegistration,
  login,
  logout
}
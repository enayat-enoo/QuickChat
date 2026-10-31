const userModel = require("../models/User");
const { tokenGenerator } = require("../utils/generateToken");
const {
  hashPassword,
  hashedPasswordVerifier,
} = require("../utils/passwordHash");
const uploadImage = require("../config/cloudinary");
const { validateRequest } = require("../middleware/validationMiddleware");

const saltRounds = Number(process.env.SALT_ROUNDS || 10);

// Cookie options that work in both local HTTP and production HTTPS.
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

//User Registration Handler Function
async function userRegistration(req, res) {
  const validationError = validateRequest(req, res);
  if (validationError) return;

  const { name, username, email, password } = req.body;

  try {
    // 🔒 Check BOTH username and email (case-insensitive email).
    const conflict = await userModel.findOne({
      $or: [
        { username },
        { email: String(email).toLowerCase() },
      ],
    });
    if (conflict) {
      // Don't reveal which field matched — generic conflict response.
      return res.status(409).json({ message: "user already exists" });
    }

    // Upload avatar to Cloudinary if provided (non-fatal).
    let avatar = null;
    if (req.file) {
      try {
        const result = await uploadImage(req.file.buffer);
        avatar = result.url;
      } catch (error) {
        console.error("avatar upload failed:", error);
        // Non-fatal: continue with null avatar.
      }
    }

    const hashedPassword = await hashPassword(password, saltRounds);

    const created = await userModel.create({
      name,
      username,
      email: String(email).toLowerCase(),
      password: hashedPassword,
      avatar,
    });

    // 🔒 Return only safe fields — never the full document.
    return res.status(201).json({
      message: "registration successful",
      data: {
        _id: created._id,
        username: created.username,
        email: created.email,
        name: created.name,
        avatar: created.avatar,
      },
    });
  } catch (error) {
    // Duplicate key (race between findOne and create, or unique index)
    if (error?.code === 11000) {
      return res.status(409).json({ message: "user already exists" });
    }
    console.error("registration error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//Login Handler Function
async function login(req, res) {
  const validationError = validateRequest(req, res);
  if (validationError) return;

  const { email, password } = req.body;

  try {
    // 🔒 .select("+password") is required because the schema now hides it.
    const findUser = await userModel
      .findOne({ email: String(email).toLowerCase() })
      .select("+password");

    // 🔒 Same response for "unknown email" and "wrong password" —
    // prevents email enumeration.
    if (!findUser) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const isMatch = await hashedPasswordVerifier(password, findUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const payload = { id: findUser._id, username: findUser.username };
    const token = await tokenGenerator(payload);

    return res
      .cookie("token", token, cookieOptions())
      .status(200)
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
    console.error("login error:", error);
    return res.status(500).json({ message: "server Error" });
  }
}

//Logout Handler function
async function logout(req, res) {
  const { maxAge, ...opts } = cookieOptions(); // maxAge not needed to clear
  return res
    .clearCookie("token", opts)
    .status(200)
    .json({ message: "logout successful" });
}

module.exports = {
  userRegistration,
  login,
  logout,
};
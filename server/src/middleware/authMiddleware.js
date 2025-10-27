const { tokenVerifier } = require("../utils/generateToken");

const secretKey = process.env.SECRET_KEY;
async function isAuthMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "token doesn't exist" });
  }

  try {
    const decoded = await tokenVerifier(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("token verification failed")
    return res.status(401).json({message : "token verification failed"});
  }
}

module.exports = isAuthMiddleware;
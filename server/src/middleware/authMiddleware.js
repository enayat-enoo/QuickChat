const  {tokenVerifier}  = require("../utils/generateToken");

async function isAuthMiddleware(req, res, next) {
  const token = req.cookies?.token;
  console.log("Received token:", token);
  if (!token) {
    return res.status(401).json({ message: "token doesn't exist" });
  }

  try {
    const decoded = await tokenVerifier(token);
    console.log("Token verified successfully:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("token verification failed")
    return res.status(401).json({message : "token verification failed"});
  }
}

module.exports = isAuthMiddleware;
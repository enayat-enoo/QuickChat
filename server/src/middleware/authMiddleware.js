const  {tokenVerifier}  = require("../utils/generateToken");
const cookie = require('cookie');
async function isAuthMiddleware(req, res, next) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) {
    return res.status(401).json({ message: "token doesn't exist" });
  }

  try {
    const decoded = await tokenVerifier(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("token verification failed")
    return res.status(401).json({message : "token verification failed"});
  }
}

module.exports = isAuthMiddleware;
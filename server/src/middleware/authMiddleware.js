const { tokenVerifier } = require("../utils/generateToken");
const cookie = require('cookie');

async function isAuthMiddleware(req, res, next) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = await tokenVerifier(token);
    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
}

module.exports = isAuthMiddleware;
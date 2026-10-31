const { tokenVerifier } = require("../utils/generateToken");
const cookie = require("cookie");

function socketAuthMiddleware(io) {
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        console.error("Socket auth: no token cookie");
        return next(new Error("Authentication failed"));
      }

      const decoded = await tokenVerifier(token);

      if (!decoded?.id) {
        console.error("Socket auth: token missing id");
        return next(new Error("Authentication failed"));
      }

      socket.user = decoded;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      return next(new Error("Authentication failed"));
    }
  });
}

module.exports = socketAuthMiddleware;
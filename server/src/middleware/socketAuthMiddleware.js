const { tokenVerifier } = require('../utils/generateToken');
const cookie = require('cookie');

function socketAuthMiddleware(io) {
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication failed: no token"));
      }

      const decoded = await tokenVerifier(token);

      if (!decoded) {
        return next(new Error("Authentication failed: invalid token"));
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
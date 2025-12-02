const { tokenVerifier } = require('../utils/generateToken');
const cookie = require('cookie');
 function socketAuthMiddleware(io){
 io.use(async (socket,next)=>{
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;
    if(!token){
        return next(new Error("Authentication failed"));
    }
    const decoded = await tokenVerifier(token);
    if(!decoded){
        return next(new Error("Authentication failed"));
    }

    socket.user = decoded;
    next();
 })
}


module.exports = socketAuthMiddleware;
const { tokenVerifier } = require('../utils/generateToken');
 function socketAuthMiddleware(io){
 io.use(async (socket,next)=>{
    const token = socket.handshake.headers.cookie.split(";")[1].split("=")[1];
    const decoded = await tokenVerifier(token);
    if(!decoded){
        return next(new Error("Authentication failed"));
    }

    socket.user = decoded;
    next();
 })
}


module.exports = socketAuthMiddleware;
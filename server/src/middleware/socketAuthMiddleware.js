const tokenVerifier = require('../utils/generateToken');
 function socketAuthMiddleware(io){
 io.use(async (socket,next)=>{
    const token = socket.handshake.auth.token;
    const decoded = await tokenVerifier(token);

    if(!decoded){
        return next(new Error("Authentication failed"));
    }

    socket.user = decoded;
    next();
 })
}


module.exports = socketAuthMiddleware;
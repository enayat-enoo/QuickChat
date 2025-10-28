const messageModel = require('../models/Message');
async function messageSocket(io){
    io.on('connection', async (socket)=>{
        console.log(`Socket Id ${socket.id}`);
        socket.on('sendMessage',async ({userData,receiverId})=>{
            socket.join(receiverId);
            io.to(receiverId).emit('getMessage',userData);
        })
    })
}

module.exports = messageSocket;
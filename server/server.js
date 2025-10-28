const app = require('./app');
const messageSocket = require('./src/sockets/chatSocket');
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketAuthMiddleware = require('./src/middleware/socketAuthMiddleware');

const server = createServer(app);
const PORT = process.env.PORT || 8000;

const io = new Server(server,{
    cors : {
        origin : process.env.CLIENT_URL,
        methods : ['GET','POST'] 
    }
});

// Apply socket authentication middleware BEFORE defining event handlers
socketAuthMiddleware(io);

// Register message socket events
messageSocket(io);

server.listen(PORT,()=>{
    console.log(`Server has started at port ${PORT}`)
})

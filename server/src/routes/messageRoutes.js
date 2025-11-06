const express = require('express');
const messageRouter = express.Router();

const  { sendMessage, getMessage, getChats } = require('../controllers/messageControllers')

messageRouter.post('/sendmessage',sendMessage);
messageRouter.get('/getmessage/:id',getMessage);
messageRouter.get('/getchats',getChats);

module.exports = messageRouter;
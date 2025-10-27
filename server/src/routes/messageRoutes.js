const express = require('express');
const messageRouter = express.Router();

const  { sendMessage, getMessage } = require('../controllers/messageControllers')

messageRouter.post('/sendmessage',sendMessage);
messageRouter.get('/getmessage/:id',getMessage);

module.exports = messageRouter;
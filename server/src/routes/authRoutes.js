const express = require('express');
const authRouter = express.Router();
const {userRegistration,login,logout} = require('../controllers/authController')


//registering routes for different paths
authRouter.post('/register',userRegistration);
authRouter.post('/login',login);
authRouter.get('/logout',logout)

module.exports = authRouter;
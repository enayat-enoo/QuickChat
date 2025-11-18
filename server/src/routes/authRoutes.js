const express = require('express');
const authRouter = express.Router();
const {userRegistration,login,logout} = require('../controllers/authController')
const upload = require('../config/multerConfig');


//registering routes for different paths
authRouter.post('/register',upload.single('avatar'),userRegistration);
authRouter.post('/login',login);
authRouter.get('/logout',logout)

module.exports = authRouter;
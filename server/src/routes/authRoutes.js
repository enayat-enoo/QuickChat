const express = require('express');
const router = express.Router();
const {userRegistration,login,logout} = require('../controllers/authController')
//routes registering for different paths

router.post('/register',userRegistration);
router.post('/login',login);
router.get('/logout',logout)

module.exports = router;
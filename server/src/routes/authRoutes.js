const express = require("express");
const router = express.Router();
const { userRegistration, login, logout } = require("../controllers/authController");
const upload = require("../config/multerConfig");
const { registerRules, loginRules } = require("../middleware/validationMiddleware");

router.post("/register", upload.single("avatar"), registerRules, userRegistration);
router.post("/login", loginRules, login);
router.get("/logout", logout);

module.exports = router;
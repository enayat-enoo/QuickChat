const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.SECRET_KEY) {
  throw new Error("FATAL: SECRET_KEY environment variable is not set.");
}

const secretKey = process.env.SECRET_KEY;

async function tokenGenerator(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: "2d" });
}

async function tokenVerifier(token) {
  return jwt.verify(token, secretKey);
}

module.exports = { tokenGenerator, tokenVerifier };
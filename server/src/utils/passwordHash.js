const bcrypt = require("bcrypt");

async function hashPassword(password, saltRounds) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.log(error);
  }
}

async function hashedPasswordVerifier(password, encryptedPassword) {
  try {
    return await bcrypt.compare(password, encryptedPassword);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  hashPassword,
  hashedPasswordVerifier,
};

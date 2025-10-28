const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;
async function tokenGenerator(payload){
    try {
        return jwt.sign(payload,secretKey, {expiresIn : "2d"});
    } catch (error) {
        console.log(error);
    }
}

async function tokenVerifier(token){
    try {
       return jwt.verify(token,secretKey); 
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    tokenGenerator,
    tokenVerifier
}
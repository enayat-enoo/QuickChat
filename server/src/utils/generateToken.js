const jwt = require('jsonwebtoken');

async function tokenGenerator(payload,secretKey){
    try {
        return jwt.sign(payload,secretKey, {expiresIn : "2d"});
    } catch (error) {
        console.log(error);
    }
}

async function tokenVerifier(token,secretKey){
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
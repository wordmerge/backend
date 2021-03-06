const JsonWebToken = require('jsonwebtoken'),
      
      JWT_TOKEN_PASS = process.env.JWT_TOKEN_PASS;


function decodeToken(token) {
  return new Promise((resolve, reject) => {
    JsonWebToken.verify(token, JWT_TOKEN_PASS, 
                        (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}

function generateToken(payload) {
  return new Promise((resolve, reject) => {
    if (!payload || typeof payload !== "object") {
      reject(new Error("Invalid payload"));
      return;
    }
    
    resolve(JsonWebToken.sign(payload, JWT_TOKEN_PASS));
  });
}

exports.decodeToken = decodeToken;
exports.generateToken = generateToken;

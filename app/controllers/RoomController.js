const Postgres = require('../utils/postgres'),
      JsonWebToken = require('jsonwebtoken'),
      
      JWT_TOKEN_PASS = process.env.JWT_TOKEN_PASS;

/**
* @private
*/
function _decodeToken(token) {
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

/**
* @private
*/
function _generateToken(payload) {
  return new Promise((resolve, reject) => {
    if (!payload || typeof payload !== "object") {
      reject(new Error("Invalid payload"));
    }
    
    JsonWebToken.sign(payload, JWT_TOKEN_PASS, 
                      (err, token) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(token);
    });
  });
}

/**
* Handles all /room route based requests
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
exports.middleware = (req, res, next) => {
  if (!("auth_token" in req.body)) {
    res.status(400).json({
      "status": 400,
      "message": "auth_token required for this route"
    });
    return;
  }
  
  _decodeToken(req.body.auth_token).then((payload) => {
    req.body.user = payload;
    next();
  }).catch((error) => {
    if (typeof error === "string") {
      res.status(400).json({
        "status": 400,
        "message": error
      });
      return;
    }
    
    res.status(400).json({
      "status": 400,
      "message": error.message
    });
  });
};

/**
* 
*/
exports.create_specific = (req, res) => {
  
};

exports.join_specific = (req, res) => {
  
};

exports.join_random = (req, res) => {
  
};

exports.leave = (req, res) => {
  
};

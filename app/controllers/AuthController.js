const Postgres = require('../utils/postgres'),
      PasswordHash = require('password-hash');

/**
* @private
*/
function _hashPassword(password) {
  return new Promise((resolve, reject) => {
    resolve(PasswordHash.generate(password));
  });
}

/**
* @private
*/
function _comparePasswordToHash(password, hash) {
  return new Promise((resolve, reject) => {
    if (PasswordHash.verify(password, hash)) {
      resolve();
      return;
    }
    reject(new Error("Incorrect Password"));
  });
}


/**
* Logs a user in, provided a username and a password
* @param {Object} req
* @param {Object} res
*/
exports.login = (req, res) => {
  let {username=null, password=null} = req.body;

  if (!username || !password) {
    res.status(400).json({
      status: 400,
      message: "username and password are required parameters"
    });
  }

  Postgres.query(
    {query: 'SELECT * FROM users WHERE username=$1',
    params: [username, password]}
  ).then((result) => {
    if (result.rows !== 1) {
      throw new Error("User does not exist");
    }

    return _comparePasswordToHash(
      password,
      result.rows[0].password
    );
  }).then(() => {
    res.status(200).json({
      status: 200,
      message: "User succesfully validated",
      auth_token: ""
    });
  }).catch((error) => {
    res.status(400).json({
      status: 400,
      message: "User not validated"
    });
  });
};


/**
* Signs a user up, provided an email, username,
*   password and image_url
* @param {Object} req
* @param {Object} res
*/
exports.signup = (req, res) => {
  let {email=null, username=null,
       password=null, image_url} = req.body;

  if (!email || !username || !password) {
    res.status(400).json({
      status: 400,
      message: "email, username and password are required parameters"
    });
  }

  _hashPassword(password).then((password) => {
    return Postgres.query(
      {query: `INSERT INTO
        users (username, password, email, created_at)
        VALUES ($1, $2, $3, now()::timestamp)`,
      params: [username, password, email]}
    );
  }).then((result) => {
    if (result.rows !== 1) {
      throw new Error("Error in user signup");
    }

    res.status(200).json({
      status: 200,
      message: "User succesfully signed up"
    });
  }).catch((error) => {
    res.status(400).json({
      status: 400,
      message: "Error in user signup"
    });
  });
};

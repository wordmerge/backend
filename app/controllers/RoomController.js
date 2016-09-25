const Postgres = require('../utils/postgres'),
      sessionToken = require('../utils/sessionToken'),
      RandomString = require('randomstring');


/**
* Handles all /room route based requests
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
exports.middleware = (req, res, next) => {
  if (!("auth_token" in req.body)) {
    res.status(400).json({
      status: 400,
      message: "auth_token required for this route"
    });
    return;
  }
  
  sessionToken
    .decodeToken(req.body.auth_token)
    .then((payload) => {
      req.body.user = payload;
      next();
    }).catch((error) => {
      res.status(400).json({
        status: 400,
        message: error.message
      });
    });
};

/**
* Creates a specific room and adds the requesting 
*   user to that room
* @param {Object} req
* @param {Object} res
*/
exports.create = (req, res) => {
  const room_id = RandomString.generate(6), 
        user_id = req.body.user.user_id,
        game_mode = req.body.game_mode;
  
  if (!game_mode || typeof game_mode !== "string") {
    res.status(400).json({
      status: 400,
      message: "Game mode is a required field"
    });
  }
  
  Postgres.query({
    query: `
      INSERT INTO rooms (room_id, game_mode, created_at) 
      VALUES ($1, $2, now()::timestamp)
    `,
    params: [room_id, game_mode]
  }).then((result) => {
    if (result.rows.length !== 1) {
      throw new Error(
        "Room wasn't created. Collision may have occured."
      );
    }
    
    return Postgres.query({
      query: `
        INSERT INTO room_users (room_id, user_id, entered_at),
        VALUES ($1, $2, now()::timestamp)
      `,
      params: [room_id, user_id]
    });
  }).then((result) => {
    if (result.rows.length !== 1) {
      throw new Error(
        "User wasn't added to the room."
      );
    }
    
    res.status(200).json({
      status: 200,
      message: "Succesfully created room",
      room_id: result.rows[0].room_id
    });
  }).catch((error) => {
    res.status(400).json({
      status: 400,
      message: error.message
    });
  });
};

/**
* Joins a specific room and adds the requesting 
*   user to that room.
* @param {Object} req
* @param {Object} res
*/
exports.join_specific = (req, res) => {
  const room_id = req.body.room_id,
        user_id = req.body.user.user_id;
  
  Postgres.query({
    query: `
      SELECT * 
      FROM rooms JOIN room_users ON room_id
      WHERE room_id=$1 AND destroyed_at IS NULL
    `
  }).then((result) => {
    if (result.rows.length === 0) {
      throw new Error(
        "No room with the provided room_id is open"
      );
    }
    else if (result.rows.length > 1) {
      throw new Error(
        "Room is already full!"
      );
    }
    
    return Postgres.query({
      query: `
        INSERT INTO room_users (room_id, user_id, entered_at),
        VALUES ($1, $2, now()::timestamp)
      `,
      params: [room_id, user_id]
    });
  }).then((result) => {
    if (result.rows.length !== 1) {
      throw new Error(
        "User wasn't added to the room. Error"
      );
    }
    
    res.status(200).json({
      status: 200,
      message: "Succesfully joined a specific room",
      room_id: result.rows[0].room_id
    });
  }).catch((error) => {
    res.status(400).json({
      status: 400,
      message: error.message
    });
  });
};

/**
* Joins a random room and adds the requesting  
*   user to that room.
* @param {Object} req
* @param {Object} res
*/
exports.join_random = (req, res) => {
  const user_id = req.body.user.user_id;
  let game_mode = null, 
      query;
  
  if ("game_mode" in req.body && 
      typeof req.body.game_mode === "string") {
    game_mode = req.body.game_mode;
  }
  
  if (!game_mode) {
    query = Postgres.query({
      query: `
        SELECT * 
        FROM rooms JOIN 
          (SELECT room_id, COUNT(*) as users_count 
            FROM room_users
            GROUP BY room_id) as room_users_count
          ON room_id
        WHERE destroyed_at IS NULL AND 
          users_count=1
        LIMIT 1
      `
    });
  }
  else {
    query = Postgres.query({
      query: `
        SELECT * 
        FROM rooms JOIN 
          (SELECT room_id, COUNT(*) as users_count 
            FROM room_users
            GROUP BY room_id) as room_users_count
          ON room_id
        WHERE destroyed_at IS NULL AND 
          users_count=1 AND 
          game_mode=$1
        LIMIT 1
      `,
      params: [game_mode]
    });
  }
  
  query.then((result) => {
    if (result.rows.length !== 1) {
      throw new Error(
        "No room is open for you to join"
      );
    }
    const room_id = result.rows[0].room_id;
    
    return Postgres.query({
      query: `
        INSERT INTO room_users (room_id, user_id, entered_at),
        VALUES ($1, $2, now()::timestamp)
      `,
      params: [room_id, user_id]
    });
  }).then((result) => {
    if (result.rows.length !== 1) {
      throw new Error(
        "User wasn't added to the room. Error"
      );
    }
    
    res.status(200).json({
      status: 200,
      message: "Succesfully joined a random room",
      room_id: result.rows[0].room_id
    });
  }).catch((error) => {
    res.status(400).json({
      status: 400,
      message: error.message
    });
  });
};

/**
* Leaves a room and adds the requesting user 
*   to that room
* @param {Object} req
* @param {Object} res
*/
exports.leave = (req, res) => {
  const user_id = req.body.user.user_id,
        room_id = req.body.room_id;
  
  Postgres.query({
    query: `
      SELECT * 
      FROM rooms 
      WHERE room_id=$1 AND destroyed_at IS NULL 
    `,
    params: [room_id]
  }).then((result) => {
    if (result.rows.length !== 1) {
      throw new Error(
        "Either that room does not exist or room is already closed"
      );
    }
    
    return Postgres.query({
      query: `
        UPDATE rooms
        SET destroyed_at=now()::timestamp
        WHERE room_id=$1 AND destroyed_at IS NULL
      `,
      params: [room_id]
    });
  }).then((result) => {
    return Postgres.query({
      query: `
        UPDATE room_users
        SET left_at=now()::timestamp
        WHERE room_id=$1 AND left_at IS NULL
      `,
      params: [room_id]
    }).then((result) => {
      res.status(200).json({
        status: 200,
        message: "Succesfully left the room",
      });
    }).catch((error) => {
      res.status(400).json({
        status: 400,
        message: error.message
      });
    });
  });
};

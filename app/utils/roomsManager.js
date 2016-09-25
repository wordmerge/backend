const sessionToken = require('./sessionToken'),
      postgres = require('./postgres'),
      _ = require('lodash');


function RoomsManager() {

  var rooms = {},
      users = {};


  this.user_joined = (event) => {
    let room_id = event.room_id,
        user_id = event.auth_token.user_id,
        users_in_room = _.get(rooms, room_id, []),
        socket = event.socket;

    event.socket.join(room_id);

    users_in_room.push(user_id);
    users[user_id] = room_id;
    rooms[room_id] = users_in_room;

    if (users_in_room.length === 2) {
      socket.to(room_id).emit(
        'data', {
          type: 'room_ready',
          other_user: {
            username: event.auth_token.username,
            image: event.auth_token.image_url
          }
        }
      );
    }
  };


  this.user_left = (event) => {
    let socket = event.socket,
        user_id = event.auth_token.user_id,
        room_id = users[user_id];

    users[user_id] = null;
    delete rooms[room_id];

    socket.to(room_id).emit(
      'data', {
        type: 'game_ended'
      }
    );
  };


  this.user_typing = (event) => {
    let socket = event.socket,
        user_id = event.auth_token.user_id,
        room_id = users[user_id];

    socket.to(room_id).emit(
      'data', {
        type: 'user_typed',
        other_user: {
          username: event.auth_token.username,
          image: event.auth_token.image_url
        }
      }
    );
  };


  this.say_word = (event) => {
    let socket = event.socket,
        user_id = event.auth_token.user_id,
        room_id = users[user_id];

    postgres.query({
      query: `
        INSERT INTO room_words (room_id, user_id,
        word, parent1, parent2, duration, halt, created_at)
        VALUES ($1, $2, $3, $4, $5,
          $6::int, $7::boolean, now()::timestamp)
      `,
      params: [room_id, user_id, event.word, event.parent1,
              event.parent2, event.duration, event.halt]
    });

    socket.to(room_id).emit(
      'data', {
        type: 'said_word',
        other_user: {
          username: event.auth_token.username,
          image: event.auth_token.image_url
        },
        word: event.word
      }
    );
  };


  /**
  * Adds a socket into the set of managed sockets within
  *   the "rooms" of the application
  * @param {Object} Socket.io TCP object
  */
  this.addSocket = (socket) => {

    socket.on('data', (data) => {
      const event = JSON.parse(data);

      sessionToken
        .decodeToken(event.auth_token)
        .then((payload) => {
          event.auth_token = payload;
          event.socket = socket;

          switch (event.type) {
            case 'user_joined':
              console.log("User joined");
              this.user_joined(event);
              break;
            case 'user_left':
              console.log("User left");
              this.user_left(event);
              break;
            case 'user_typing':
              console.log("User typing");
              this.user_typing(event);
              break;
            case 'say_word':
              console.log("User said word");
              this.say_word(event);
              break;
          }
      });
    });
  };

}

module.exports = RoomsManager;

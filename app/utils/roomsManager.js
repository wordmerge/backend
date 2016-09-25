const sessionToken = require('./sessionToken'),
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
    
    socket.to(room_id).emit(
      'data', {
        type: 'said_word',
        other_user: {
          username: event.auth_token.username,
          image: event.auth_token.image_url
        }
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
              this.user_joined(event);
              break;
            case 'user_left':
              this.user_left(event);
              break;
            case 'user_typing':
              this.user_typing(event);
              break;
            case 'say_word':
              this.say_word(event);
              break;
          }
      });
    });
  };

}

module.exports = RoomsManager;

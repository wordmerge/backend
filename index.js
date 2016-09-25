require('dotenv').config({
  'path': '/source/.env'
});

const App = require('express')(),
      BodyParser = require('body-parser'),
      AuthController = require('./app/controllers/AuthController'),
      RoomController = require('./app/controllers/RoomController'),
      RoomsManager = require('./app/utils/roomsManager')();

App.use(BodyParser.json());

App.post('/auth/login', AuthController.login);
App.post('/auth/signup', AuthController.signup);

App.use('/room', RoomController.middleware);
App.post('/room/create', RoomController.create);
App.post('/room/join_specific', RoomController.join_specific);
App.post('/room/join_random', RoomController.join_random);
App.post('/room/leave', RoomController.leave);

const SocketIO = require('socket.io')(
  App.listen(process.env.PORT, () => {
    console.log("Listening to Port:" + process.env.PORT);
  })
);

SocketIO.on("connection", 
            (socket) => RoomsManager.addSocket(socket));

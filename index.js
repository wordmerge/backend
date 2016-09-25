require('dotenv').config({
  'path': '/source/.env'
});

const App = require('express')(),
      http = require('http'),
      server = http.createServer(App),
      BodyParser = require('body-parser'),
      AuthController = require('./app/controllers/AuthController'),
      RoomController = require('./app/controllers/RoomController'),
      RoomsManager = new require('./app/utils/roomsManager')();
      console.log(RoomsManager);

App.use(BodyParser.json());

App.post('/auth/login', AuthController.login);
App.post('/auth/signup', AuthController.signup);

App.use('/room', RoomController.middleware);
App.post('/room/create', RoomController.create);
App.post('/room/join_specific', RoomController.join_specific);
App.post('/room/join_random', RoomController.join_random);
App.post('/room/leave', RoomController.leave);

const sessionToken = require('./app/utils/sessionToken');
function _hashPassword(password) {
  return new Promise((resolve, reject) => {
    resolve(PasswordHash.generate(password));
  });
}
App.post('/auth/randAuth', function(req, res) {
    sessionToken.generateToken({id: Math.random()})
    .then((token) => {
        console.log(token);
      res.status(200).json({
        status: 200,
        message: "User succesfully validated",
        auth_token: token
      });
    }).catch((error) => {
      res.status(400).json({
        status: 400,
        message: error.message
      });
    });
})


const SocketIO = require('socket.io')(
  App.listen(process.env.PORT, () => {
    console.log("Listening to Port:" + process.env.PORT);
  })
);

SocketIO.on("connection",
            (socket) => RoomsManager.addSocket(socket));

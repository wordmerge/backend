require('dotenv').config({
  'path': '/source/.env'
});

const App = require('express')(),
      http = require('http'),
      server = http.createServer(App),
      BodyParser = require('body-parser'),
      AuthController = require('./app/controllers/AuthController'),
      RoomController = require('./app/controllers/RoomController'),
      RoomsManager = new (require('./app/utils/roomsManager'))();

App.use(BodyParser.json());

App.post('/auth/login', AuthController.login);
App.post('/auth/signup', AuthController.signup);

App.use('/room', RoomController.middleware);
App.post('/room/create', RoomController.create);
App.post('/room/join_specific', RoomController.join_specific);
App.post('/room/join_random', RoomController.join_random);
App.post('/room/leave', RoomController.leave);

// Quick Hack ---->
const sessionToken = require('./app/utils/sessionToken');
var i = 0;
App.post('/auth/randAuth', function(req, res) {
    sessionToken.generateToken({user_id: i})
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
    i++;
});


function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

<<<<<<< HEAD
/*sleep(20000, () => {
    AuthController.signup({body: {email: 'test1@gmail.com', username: 'bill', password: '1234', image_url: ''}}, {});
    AuthController.signup({body: {email: 'test@gmail.com', username: 'frank', password: '1234', image_url: ''}}, {});
});*/
=======
sleep(20000, () => {
    AuthController.signup({body: {
      email: 'test1@gmail.com', 
      username: 'bill', 
      password: '1234', 
      image_url: ''}}, {
    });
    AuthController.signup({body: {
      email: 'test@gmail.com', 
      username: 'frank', 
      password: '1234', 
      image_url: ''}}, {
    });
});
>>>>>>> d343617d1b4cadf04bdd72260cd651789425fb71

const Http = require('http'),
      Server = Http.createServer(App), 
      SocketIO = require('socket.io')(Server);

SocketIO.on("connection",
            (socket) => RoomsManager.addSocket(socket));

Server.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

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

/*sleep(20000, () => {
    AuthController.signup({body: {email: 'test1@gmail.com', username: 'bill', password: '1234', image_url: ''}}, {});
    AuthController.signup({body: {email: 'test@gmail.com', username: 'frank', password: '1234', image_url: ''}}, {});
});*/
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

const Http = require('http'),
      Server = Http.createServer(App),
      SocketIO = require('socket.io')(Server);

//SocketIO.on("connection",
            //(socket) => RoomsManager.addSocket(socket));
var players = []
var i = 0;
SocketIO.on("connection", (socket) => {
    /*if(i == 0) {
        players[0] = socket;
        players[0].on("user_typing", (data) => {
            players[1].emit("user_typed")
        })
        players[0].on("say_word", (data) => {
            players[other(1)].emit("said_word", {word: data.word});
        })
    } else {
        players[1] = socket;
        players[1].on("user_typing", (data) => {
            players[other(0)].emit("user_typed")
        })
        players[1].on("say_word", (data) => {
            players[other(0)].emit("said_word", {word: data.word});
        })
    }*/
    /*players[i] = socket;
    players[i].on("user_typing", (data) => {
        players[data.id].emit("user_typed", {id: data.id})
    })
    players[i].on("say_word", (data) => {
        players[data.id].emit("said_word", {word: data.word, id: data.id});
    })*/
    socket.on("in", (data) => {
        players[data.id] = socket;
        socket.other = other(data.id);
    })
    socket.on("user_typing", (data) => {
        players[socket.other].emit("user_typed", {id: data.id})
    })
    socket.on("say_word", (data) => {
        players[socket.other].emit("said_word", {id: data.id})
    })
    i = other(i);
})

function other(i) {
    if(i == 0)
        return 1;
    else
        return 0;
}

Server.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

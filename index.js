require('dotenv').config({
  'path': '/source/.env'
});

const App = require('express')(),
      BodyParser = require('body-parser'),
      AuthController = require('./app/controllers/AuthController'),
      RoomController = require('./app/controllers/RoomController'),
      postgres = require('./app/utils/postgres.js');

App.use(BodyParser.json());

App.post('/auth/login', AuthController.login);
App.post('/auth/signup', AuthController.signup);

App.use('/room', RoomController.middleware);
App.post('/room/create_specific', RoomController.create_specific);
App.post('/room/join_specific', RoomController.join_specific);
App.post('/room/join_random', RoomController.join_random);
App.post('/room/leave', RoomController.leave);

App.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

sleep(50000, test);

function test(){
    AuthController.signup({body: {email: 'jmorg035@fiu.edu', username: 'jose', password: '1234', image_url: 'http://i.imgur.com/Qi1xDby.jpg'}});
    AuthController.signup({body: {email: 'kmitc001@fiu.edu', username: 'kerlin', password: '1234', image_url: 'http://i.imgur.com/Qi1xDby.jpg'}});
    RoomController.create_specific({body: {user: {user_id: 1}}});
    //RoomController.join_random({body: {user: {user_id: 2}}});
    postgres.query({query: 'SELECT * FROM rooms'}).then((res, rej) => {
        console.log(res);

    });
}

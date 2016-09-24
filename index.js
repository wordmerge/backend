const App = require('express')(),
      AuthController = require('./controllers/AuthController'),
      RoomController = require('./controllers/RoomController');

require('dotenv').config({
  path: '../.env'
});

App.post('/auth/login', AuthController.login());
App.post('/auth/signup', AuthController.signup());

App.post('/room/create_specific', RoomController.create_specific());

App.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

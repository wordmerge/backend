require('dotenv').config({
  'path': '/source/.env'
});

const App = require('express')(),
      AuthController = require('./app/controllers/AuthController'),
      RoomController = require('./app/controllers/RoomController');

App.post('/auth/login', AuthController.login);
App.post('/auth/signup', AuthController.signup);

App.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

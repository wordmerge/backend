require('dotenv').config({
  'path': '/source/.env'
});

const App = require('express')(),
      AuthController = require('./app/controllers/AuthController'),
      RoomController = require('./app/controllers/RoomController');

App.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

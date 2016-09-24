const App = require('express')(),
      AuthController = require('./controllers/AuthController'),
      RoomController = require('./controllers/RoomController');

require('dotenv').config({
  path: '../.env'
});



App.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

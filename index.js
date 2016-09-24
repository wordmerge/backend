const App = require('express')(),
      AuthController = require('./app/controllers/AuthController'),
      RoomController = require('./app/controllers/RoomController');

require('dotenv').config();



App.listen(process.env.PORT, () => {
  console.log("Listening to Port:" + process.env.PORT);
});

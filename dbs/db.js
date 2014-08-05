var mongoose = require('mongoose');
var config = require('../conf/config.js'); //config settings based on what environment we are in

//create the db connection
mongoose.connect(config.dbURI);


// Define connection events
mongoose.connection.on('connected', function(){
  console.log('Mongoose connected to ' + config.dbURI);
});

// istanbul ignore next: no test for con error
mongoose.connection.on('error', function(err){
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function(){
  console.log('Mongoose disconnected');
});

process.on('SIGINT', function(){
  mongoose.connection.close(function(){
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

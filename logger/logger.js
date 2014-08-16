var winston = require('winston');
var config = require('../conf/config.js');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      level: config.loggerLevel
    })
  ],
  levels: {
    info: 3,
    warn: 4,
    debug: 5,
    error: 6
  },
  colors: {
    info: white,
    warn: orange,
    debug: yellow,
    error: red
  }
});

module.exports = logger;

var apnagent = require('apnagent');
var User = require('../models/user.js');
var path = require('path');
var config = require('../conf/config.js');
//TODO, this is the wrong place for this dependency
var feedback = require('../apn/feedback.js');
var logger = require('../logger/logger.js');

//set environment based options
// istanbul ignore next
if (config.env === 'dev'){
  var agent = module.exports = new apnagent.Agent();
  agent.enable('sandbox');
} else if (config.env === 'local'){
  var agent = module.exports = new apnagent.MockAgent();
  agent.enable('sandbox');
} else {
  var agent = module.exports = new apnagent.Agent();
}

//set the credentials
agent
.set('pfx file', path.join(process.cwd(), config.pfxPath));

agent.
  connect(function(err){
  // istanbul ignore if
  // handle any auth problems
  if (err && err.name === 'GatewayAuthorizationError'){
    logger.error("Authentication Error:", {err: err});
    process.exit(1);
  }
  // istanbul ignore if
  else if (err) {
    //handle other errors
    logger.error("Error! ", {err: err, stack: new Error().stack});
  } else {
    // it worked, don't be so surprised...
    var env = agent.enabled('sandbox') ? 'sandbox' : 'production';
    logger.info('apnagent [%s] gateway connected', env);
  }
});

agent.on('mock:message', function (raw) {
  var device = new apnagent.Device(raw.deviceToken);
  logger.info('mock:message');
  logger.info('==> %d - %s', raw.identifier, device.toString());
  logger.info(JSON.stringify(raw.payload, null, 2));
});

// istanbul ignore next
agent.on('message:error', function(err, msg){
  if (err){
    if (err.name === 'GatewayNotificationError'){
      logger.error('message:error GatewayNotificationError: %s', err.message);
    } else if (err.code === 8){
      //err.code is what apple reports
      //TODO we need to flag this token as invalid and not send messages to it
      logger.info('error num: %s > remove device: %s', err.code, msg.device().toString());
      var User = require('../models/user.js');
      User.gatewayRemoveDevice({uuid: msg.device().toString()}, function(err){
        if (err){
          logger.error("Couldn't remove with gateway error: ", err);
        } else{
          logger.info("Success in removing device %s", msg.device().toString());
        }
      });
    } else if (err.name === 'SerializationError'){
      //happens when apnagent has a problem encoding message for transfer
      logger.error('[message:error] SerializationError: %s', err.message);
    } else {
      //unlikely but could occur over a dead socket
      logger.error('[message:error] other error: %s, error#: %d', err.message, err.code);
    }
  }
});


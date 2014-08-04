var apnagent = require('apnagent');
var User = require('../models/user.js');
var path = require('path');
var config = require('../conf/config.js');

//set environment based options
// istanbul ignore next
if (config.env === 'prod'){
  var agent = module.exports = new apnagent.Agent();
} else if (config.env === 'local'){
  var agent = module.exports = new apnagent.MockAgent();
  agent.enable('sandbox');
} else {
  var agent = module.exports = new apnagent.Agent();
  agent.enable('sandbox');
}

//set the credentials
agent
.set('pfx file', path.join(process.cwd(), config.pfxPath));

agent.
  connect(function(err){
  // istanbul ignore if
  // handle any auth problems
  if (err && err.name === 'GatewayAuthorizationError'){
    console.log('Authentication Error: %s', err.message);
    process.exit(1);
  }
  // istanbul ignore if
  else if (err) {
    //handle other errors
    console.log("error: ", err, new Error().stack);
  } else {
    // it worked, don't be so surprised...
    var env = agent.enabled('sandbox') ? 'sandbox' : 'production';
    console.log('apnagent [%s] gateway connected', env);
  }
});

agent.on('mock:message', function (raw) {
  var device = new apnagent.Device(raw.deviceToken);
  console.log('mock:message');
  console.log('==> %d - %s', raw.identifier, device.toString());
  console.log(JSON.stringify(raw.payload, null, 2));
});

// istanbul ignore next
agent.on('message:error', function(err, msg){
  if (err){
    if (err.name === 'GatewayNotificationError'){
      console.log('message:error GatewayNotificationError: %s', err.message);
    } else if (err.code === 8){
      //err.code is what apple reports
      //we need to flag this token as invalid and not send messages to it
      console.log('    > %s', msg.device().toString());
    } else if (err.name === 'SerializationError'){
      //happens when apnagent has a problem encoding message for transfer
      console.log('[message:error] SerializationError: %s', err.message);
    } else {
      //unlikely but could occur over a dead socket
      console.log('[message:error] other error: %s, error#: %d', err.message, err.code);
    }
  }
});


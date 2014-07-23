var apnagent = require('apnagent');
var path = require('path');
var config = require('../conf/config.js');

if (config.env === 'prod'){
  var agent = module.exports = new apnagent.Agent();
} else if (config.env === 'local'){
  var agent = module.exports = new apnagent.MockAgent();
  agent
  .enable('sandbox');
} else {
  var agent = module.exports = new apnagent.Agent();
  agent
  .enable('sandbox');
}

//set the credentials
agent
.set('pfx file', path.join(process.cwd(), config.pfxPath));
//credentials were for development

agent.
  connect(function(err){
  // handle any auth problems
  if (err && err.name === 'GatewayAuthorizationError'){
    console.log('Authentication Error: %s', err.message);
    process.exit(1);
  }
  else if (err) {
    //handle other errors
    throw err;
  } else {
    // it worked, don't be so surprised...
    var env = agent.enabled('sandbox') ? 'sandbox' : 'production';
    console.log('apnagent [%s] gateway connected', env);
  }
});

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

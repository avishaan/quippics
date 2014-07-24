var apnagent = require('apnagent');
var path = require('path');
var config = require('../conf/config.js');

if (config.env === 'prod'){
  var agent = module.exports = new apnagent.Agent();
  var feedback = new apnagent.Feedback();
} else if (config.env === 'local'){
  var agent = module.exports = new apnagent.MockAgent();
  agent.enable('sandbox');
  var feedback = new apnagent.MockFeedback();
  feedback.enable('sandbox');
} else {
  var agent = module.exports = new apnagent.Agent();
  agent.enable('sandbox');
  var feedback = new apnagent.Feedback();
  feedback.enable('sandbox');
}

//set some options
feedback.set('concurrency', 1); //low priority to the feedback api, need to serve reqs

//set the credentials
agent
.set('pfx file', path.join(process.cwd(), config.pfxPath));
 feedback.set('pfx file', path.join(process.cwd(), config.pfxPath));
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

feedback.connect(function (err) {
  if (err && 'FeedbackAuthorizationError' === err.name) {
    console.log('Feedback Gateway Error %s: %s', err.name, err.message);
    console.log("check certs");
  } else if (err) {
    console.log('Feedback Gateway Error %s: %s', err.name, err.message);
    throw err;
  } else {
    console.log('apngent Feedback gateway connected');
  }
});

feedback.use(function(device, timestamp, next){
  console.log("Device: %s at time: %s", device.toString(), timestamp);
  //find the user with that token
  //check the timestamp, make sure the feedback event is newer than the current timestamp
  //if the feedback event was newer, go ahead and set allowNotifications to false
  //if feedback event was older, just ignore since it means they registered after unsubbing
});

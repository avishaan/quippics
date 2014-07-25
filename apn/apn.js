var apnagent = require('apnagent');
var User = require('../models/user.js');
var path = require('path');
var config = require('../conf/config.js');

//set environment based options
if (config.env === 'prod'){
  var agent = module.exports = new apnagent.Agent();
  var feedback = new apnagent.Feedback();
} else if (config.env === 'local'){
  var agent = module.exports = new apnagent.MockAgent();
  agent.enable('sandbox');
  var feedback = new apnagent.MockFeedback();
  feedback
  .enable('sandbox')
  .set('interval', '1s'); // connection time to feedback service every 1s 
//  User.create({
//    username: 'test',
//    deviceToken: 'feedface01',
//    tokenTimestamp: Date.now()
//  });
//  debugger;
//  setTimeout(function () {
//    feedback.unsub('feedface01');
//  }, 2500);
} else {
  var agent = module.exports = new apnagent.Agent();
  agent.enable('sandbox');
  var feedback = new apnagent.Feedback();
  feedback.enable('sandbox');
}

//set some options global
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

agent.on('mock:message', function (raw) {
  var device = new apnagent.Device(raw.deviceToken);
  console.log('');
  console.log('==> %d - %s', raw.identifier, device.toString());
  console.log(JSON.stringify(raw.payload, null, 2));
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
  console.log("Device: %s at time: %s wants to unsub", device.toString(), timestamp);
  User.stopNotifications({device: device, timestamp: timestamp}, function(err){
    if (err){
      console.warn("error: ", err, "stack: ", new Error().stack);
    }
  });
  next(); //we don't really need to wait for anything to finish as there is no error reporting
});


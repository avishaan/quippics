var apnagent = require('apnagent');
var config = require('../conf/config.js');
var User = require('../models/user.js');
var path = require('path');


//set environment based options
// istanbul ignore next
if (config.env === 'prod'){
  var feedback = module.exports = new apnagent.Feedback();
} else if (config.env === 'local'){
  var feedback = module.exports = new apnagent.MockFeedback();
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
  var feedback = module.exports = new apnagent.Feedback();
  feedback.enable('sandbox');
}
//set feedback credentials
feedback.set('pfx file', path.join(process.cwd(), config.pfxPath));

//set some options global
feedback.set('concurrency', 1); //low priority to the feedback api, need to serve reqs

feedback.connect(function (err) {
  // istanbul ignore if
  if (err && 'FeedbackAuthorizationError' === err.name) {
    console.log('Feedback Gateway Error %s: %s', err.name, err.message);
    console.log("check certs");
    // istanbul ignore if
  } else if (err) {
    console.log('Feedback Gateway Error %s: %s', err.name, err.message);
  } else {
    console.log('apngent Feedback gateway connected');
  }
});

feedback.use(function(device, timestamp, next){
  console.log("Device: %s at time: %s wants to unsub", device.toString(), timestamp);
  User.unsubDevice({device: device, timestamp: timestamp}, function(err){
    if (err){
      console.warn("error: ", err, "stack: ", new Error().stack);
    }
  });
  next(); //we don't really need to wait for anything to finish as there is no error reporting
});

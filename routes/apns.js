var async = require('async');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var agent = require('../apn/apn.js');

//test/debug apn
exports.debugPush = function(req, res){
  agent.createMessage()
  .device(req.body.uuid)
  .alert('Hello Jello!')
  .send(function(err){
    //we will not worry about this one and assume a successful send
    return res.send(200, {
      clientMsg: "Attempting",
      err: err
    });
  });
};
//test/debug apn
exports.debugChallenge = function(req, res){
  agent.createMessage()
  .device(req.body.uuid)
  .alert({
    'body': 'You were invited to a new challenge!',
    'action-loc-key': 'accept challenge!'
  })
  .set({
    'type': 'challenge',
    '_id': '52fc632f2c769a7503000003',
    'title': 'Challenge 1 title'
  })
  .send(function(err){
    //we will not worry about this one and assume a successful send
    return res.send(200, {
      clientMsg: "Attempting",
      err: err
    });
  });
};

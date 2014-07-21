var async = require('async');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var agent = require('../apn/apn.js');

//test/debug apn
exports.debugPush = function(req, res){
  if (!validator.isUUID(req.body.uuid)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  agent.createMessage()
  .device(req.body.uuid)
  .alert('Hello Jello!')
  .send(function(err){

  });
  return res.send(200, 'attempting');
};

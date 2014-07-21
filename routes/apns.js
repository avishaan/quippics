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

/*
|-------------------------------------------------------------
| User Routes
|-------------------------------------------------------------
*/

var User = require("../models/user.js");

exports.list = function(req, res){
  res.send("respond with a resource");
};
//Authenticate a user in order to get the user id here
exports.authenticate = function(req, res){
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });
  user.authenticate(function(err, authUser){
    if (!err){
      if (authUser){
        return res.send(200, {
          '_id': authUser._id
        });
      } else {
        return res.send(409, {
          'clientMsg': 'Wrong username or password'
        });
      }
    } else {
      return res.send(500, {
        'err': err,
        'clientMsg': 'Could not find user'
      });
    }
  });
};
//Register a new user here
exports.register = function(req, res){
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });
  user.save(function(err, newUser){
    if (!err){
      res.send(200, {
        'username': newUser.username
      });
    } else {
      res.send(500, {
        'err': err,
        'clientMsg': 'Could not register user'
      });
    }
  });
};


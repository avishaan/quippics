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
        return res.send(401, {
          'clientMsg': 'Wrong username or password'
        });
      }
    } else {
      return res.send(401, {
        'err': err,
        'clientMsg': 'Wrong username or password'
      });
    }
  });
};
//Update a user here
exports.update = function(req, res){
  User.findOne({_id: req.params.uid}, function(err, user){
    if (!err){
      if (user){
        //get the information passed in from the body and set it to the properties of the model
        //user.username  = req.body.username ? req.body.username : user.username;
        user.email = req.body.email ? req.body.email : user.email;
        user.password = req.body.newPassword ? req.body.newPassword : user.password;
        user.addImage(req, function(){
          //save the user the user to the database.
          user.save(function(err, updatedUser){
            if (!err){
              res.send(200, {
                username: updatedUser.username,
                _id : updatedUser._id
              });
            } else { //there was some sort of db error saving
              res.send(500, err);
            }
          });
        });
      } else { //no user found, no error
        res.send(404);
      }
    } else { //some sort of error, let the client know
      console.log("some error");
      res.send(500, err);
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
  user.addImage(req, function(err){
    if (!err){
      user.save(function(err, newUser){
        if (!err){
          return res.send(200, {
            'username': newUser.username,
            '_id': newUser._id
          });
        } else {
          return res.send(500, {
            'err': err,
            'clientMsg': 'Could not register user'
          });
        }
      });
    } else {
      return res.send(500, err);
    }
  });
};

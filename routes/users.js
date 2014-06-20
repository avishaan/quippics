/*
|-------------------------------------------------------------
| User Routes
|-------------------------------------------------------------
*/

var User = require("../models/user.js");
var perPage = 24;

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
//search for a user and return list of results
exports.search = function(req, res){
  var search = new RegExp('^([a-z0-9_\\.-]*)'+req.params.search+'([a-z0-9_\\.-]*)$', "i");
  User.find({username: search})
    .select('username thumbnail')
    .exec(function(err, users){
      if (!err){
        if (users){
          res.send(users);
        } else {
          res.send(404, {clientMsg: "No users found, try another search term"});
        }
      } else {
        res.send(500, err);
      }
    });
};
//get list of users
exports.listUsers = function(req, res){
  //TODO, show users with pending friend requests
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  User.find({}, 'username _id thumbnail')
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    .exec(function(err, users){
      if(!err){
        res.send(200, users);
      } else {
        res.send(500, err);
      }

    });
};
//get profile of a user
exports.profile = function(req, res){
  User.findOne({_id: req.params.uid})
    .select('username email thumbnail rank')
    .exec(function(err, user){
      if (!err){ //no error
        if (user){
          res.send(200, user);
        } else { //we didn't find a user but no error
          res.send(404);
        }
      } else { //error occured
        res.send(500, err);
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

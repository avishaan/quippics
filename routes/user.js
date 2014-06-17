/*
|-------------------------------------------------------------
| User Routes
|-------------------------------------------------------------
*/

var User = require("../models/user.js");

exports.list = function(req, res){
  res.send("respond with a resource");
};

//add someone to list of users this user trusts
exports.addSupporters = function(req, res){
  var users = {
    supporter: {
      "network": req.params.network,
      "id": req.params.uid
    },
    "receiver": {
      "network": req.body.network,
      "id": req.body.support
    }
  };
  User.supportUser(users, function(err, receiver){
    if (!err){
      if (receiver){
        res.send(200, receiver);
      } else {
        res.send(404, {"clientMsg": "Couldn't find receiver in order to support he(r)"});
      }
    } else {
      res.send(500, err);
    }
  });
};

//find how trustworthy a user is
exports.checkSupporters = function(req, res){
//create user object for passing to findUser function
  var user = {
    "network": req.params.network,
    "id": req.params.uid
  };
  User.findUser(user, function(err, user){
    if (!err){
      if (user){
        //we found a user, show how many people trust the user in question
        return res.send(200, {"supportersCount": user.supporters.length});
      } else {
        //todo, go ahead and create user since we at least know such a user exists
        User.create(user, function(err, user){
          if (!err){
            if (user){
              //we found a user, show how many people trust the user in question
              return res.send(200, {"supportersCount": user.supporters.length});
            } else {
              return res.send(500, {"clientMsg": "Could not create user for some unknown reason"});
            }
          } else {
            return res.send(500, {"clientMsg": "Some sort of database error, see err for details", "err": err})
          }
        });
      }
    } else {
      return res.send(500, err);
    }
  });
};
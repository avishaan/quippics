/*
|-------------------------------------------------------------
| Database related routes
|-------------------------------------------------------------
*/
var User = require("../models/user.js");

exports.delete = function (req, res){
  User.remove({}, function(err, users){
    if (!err){
      return res.json(200, {"users": users}); //send to the front end list of how many items were removed

    } else {
      return res.send(500, {"clientMsg": "Couldn't delete", "err": err});
    }
  });
};

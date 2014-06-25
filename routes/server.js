/*
|-------------------------------------------------------------
| Database related routes
|-------------------------------------------------------------
*/
var User = require("../models/user.js");
var Challenge = require("../models/challenge.js");
var Submission = require("../models/submission.js");
var Activity = require("../models/activity.js");
var async = require('async');
exports.delete = function (req, res){
  async.parallel([
    function(cb){
      //Clear the users
      User.remove({}, function(err, users){
        if (!err){
          cb(null, users);
        } else {
          cb(err);
        }
      });
    },
    function(cb){
      //clear the challenges
      Challenge.remove({}, function(err, challenges){
        if (!err){
          cb(null, challenges);
        } else {
          cb(err);
        }
      });
    },
    function(cb){
      //clear the submissions
      Submission.remove({}, function(err, submissions){
        if (!err){
          cb(null, submissions);
        } else {
          cb(err);
        }
      });
    },
    function(cb){
      //clear the activities
      Activity.remove({}, function(err, activities){
        if (!err){
          cb(null, activities);
        } else {
          cb(err);
        }
      });
    }
  ],
  function(err, results){
    if (err){
      return res.send(500, err);
    } else {
      //send to the front end how many items were removed
      new User({
        username: 'admin',
        password: 'admin'
      }).save();
      return res.send(200, {
        "users": results[0],
        "challenges": results[1],
        "submissions": results[2],
        "activities": results[3]
      });
    }
  });
};

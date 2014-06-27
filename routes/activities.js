var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var async = require('async');
var perPage = 24; //submissions per page

//read activities from a user's friends
exports.friendActivities = function(req, res){
  //find the activities related to a user (where the subject or object match the user's friends)
  async.waterfall([
  function(cb){
    //get the user's friends
    User
    .findOne({_id: req.params.uid})
    .select('friends')
    .exec(function(err, user){
      if (!err && user){
        cb(null, user);
      } else if (!user) {
        cb({clientMsg: "Could not find user"});
      } else{
        cb(err);
      }
    });
  },
  function(user,cb){
    //get all the activities that match anyone in the user's friends
    Activity
    .find()
    .or([{subject: {$in: user.friends}}, {object: {$in: user.friends}}])
    .sort({date: 'descending'})
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    .populate({
      path: 'object',
      select: 'username thumbnail'
    })
    .populate({
      path: 'subject',
      select: 'username thumbnail'
    })
    .populate({
      path: 'subject',
      select: 'username thumbnail'
    })
    .populate({
      path: 'references.submission',
      select: 'owner'
    })
    .populate({
      path: 'references.challenge',
      select: 'title owner expiration'
    })
    .exec(function(err, activities){
      if (!err && activities.length){
        res.send(200, activities);
      } else if(!err){
        res.send(200, activities);
      } else {
        res.send(500, err);
      }
    });
  }
  ], function(err, results){

  })
};
//read activities from a user
exports.myActivities = function(req, res){
  //find the activities related to a user (where the subject or object match the user)
  Activity
  .find()
  .or([{subject: req.params.uid}, {object: req.params.uid}])
  .sort({date: 'descending'})
  .skip(perPage * (req.params.page - 1))
  .limit(perPage)
  .populate({
    path: 'object',
    select: 'username thumbnail'
  })
  .populate({
    path: 'subject',
    select: 'username thumbnail'
  })
  .populate({
    path: 'subject',
    select: 'username thumbnail'
  })
  .populate({
    path: 'references.submission',
    select: 'owner'
  })
  .populate({
    path: 'references.challenge',
    select: 'title owner expiration'
  })
  .exec(function(err, activities){
    if (!err && activities.length){
      res.send(200, activities);
    } else if(!err){
      res.send(200, activities);
    } else {
      res.send(500, err);
    }
  });
};

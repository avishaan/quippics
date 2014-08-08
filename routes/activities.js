var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Challenge = require('../models/challenge.js');
var async = require('async');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var _ = require('underscore');
var perPage = 24; //submissions per page

//read activities from a user's friends
exports.friendActivities = function(req, res){
  // istanbul ignore if: not testing bad input
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
        // istanbul ignore else: db error
      } else if (!user) {
        cb({clientMsg: "Could not find user"});
      } else {
        cb(err);
      }
    });
  },
  function(user, cb){ //get all of the user's challenges
    Challenge
    .find({'participants.user': req.params.uid})
    .select('_id')
    .lean()
    .exec(function(err, challenges){
      if (!err && challenges && challenges.length){
        var challengeids = _.map(challenges, function(challenge){return challenge._id.toString();});
        cb(null, user, challengeids);
      } else {
        cb({clientMsg: "Couldn't find challenges", err: err});
      }
    });
  },
  function(user, challengeids, cb){
    //get all the activities that match anyone in the user's friends
    //but also only if they match the challenges
    Activity
    .find({'references.challenge': {$in: challengeids}})
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
        cb(null, activities);
        // istanbul ignore else: db error
      } else if(!err){
        cb({clientMsg: "Could not find activities for user's friends"});
      } else {
        cb(err);
      }
    });
  }
  ], function(err, activities){
    if (!err){
      return res.send(200, activities);
    } else{
      return res.send(500, err);
    }
  });
};
//read activities from a user
exports.myActivities = function(req, res){
  //find the activities related to a user (where the subject or object match the user)
  // istanbul ignore if: not testing bad input
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
      return res.send(200, activities);
      // istanbul ignore else: db error
    } else if(!err){
      return res.send(404, {clientMsg: "No Activities Found for this user"});
    } else {
      return res.send(500, err);
    }
  });
};

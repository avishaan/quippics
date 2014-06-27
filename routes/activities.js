var perPage = 24; //submissions per page
var Activity = require('../models/activity.js');

//read activities from a user's friends
exports.friendActivities = function(req, res){
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

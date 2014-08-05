var mongoose = require('mongoose');
var Submission = require("../models/submission.js");
var Ballot = require("../models/ballot.js");
var Challenge = require('../models/challenge.js');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var fs = require('fs');

//function for some debugging when necessary
// istanbul ignore next: unofficial debug route
exports.debug = function(req, res){
  console.log("debugger function for ballot entered");
  res.send(200);
};

//get the array of submission id's that the user has voted on
exports.userVoted = function(req, res){
  // istanbul ignore if: incorrect input
  if (!isObjectId(req.params.cid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .findOne({_id: req.params.cid})
    .select('submissions')//return only the submissions, we don't need the challenge info
    .populate({
      path: 'submissions',
      select: 'ballots'
    })
    //.select('submissions.ballots')
    .where('submissions')//where voter id equals the uid passed in
    .exec(function(err, challenge){
      if (!err && challenge){
        //todo, this is all async and should be a proper query
        var votedSubmissions = [];
        challenge.submissions.forEach(function(submission){
          submission.ballots.forEach(function(ballot){
            if (ballot.voter.toString() === req.params.uid){
              votedSubmissions.push(submission.id);
            }
          });
        });
        return res.send(200, votedSubmissions);
        // istanbul ignore else: db error
      } else if (!err){
        return res.send(404, {clientMsg: "Could not find Challenge with that id"});
      } else {
        return res.send(500, err);
      }
    });
};
//Submit vote for specific submission
exports.create = function(req, res){
  //find the challenge
  // istanbul ignore if: incorrect input
  if (!isObjectId(req.body.voter) ||
      !validator.isNumeric(req.body.score) ||
      !isObjectId(req.params.sid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission.findOne({_id: req.params.sid}, function(err, submission){
    // istanbul ignore else: db error
    if (!err){
      if (submission){
        //we found the submission, let's create the new ballot from the passed in parameters
        var newBallot = new Ballot({
          voter: req.body.voter,
          score: req.body.score
        });
        //push the ballot (subdoc) onto the submission (parent doc)
        submission.ballots.push(newBallot);
        //newBallot.save();
        submission.save(function(err, submission){
          if (!err && submission){
            require("../models/activity.js").create(submission.ballots.id(newBallot.id));
            return res.send(200, submission);
            // istanbul ignore else: db error
          } else if (!err) {
            return res.send(500, {clientMsg: "Could not save submission"});
          } else {
            return res.send(500, err);
          }
        });
      } else { //no challenge was returned
        return res.send(404, {clientMsg: "No Submission found with that id"});
      }
    } else {
      return res.send(500, err);
    }
  });
};

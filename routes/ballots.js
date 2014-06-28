var mongoose = require('mongoose');
var Submission = require("../models/submission.js");
var Ballot = require("../models/ballot.js");
var Challenge = require('../models/challenge.js');
var fs = require('fs');

//function for some debugging when necessary
exports.debug = function(req, res){
  console.log("debugger function for ballot entered");
  res.send(200);
};

//get the array of submission id's that the user has voted on
exports.userVoted = function(req, res){
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
      //todo, this is all async and should be a proper query
      var votedSubmissions = [];
      challenge.submissions.forEach(function(submission){
        submission.ballots.forEach(function(ballot){
          if (ballot.voter.toString() === req.params.uid){
            votedSubmissions.push(submission.id);
          }
        });
      });
      res.send(200, votedSubmissions);
    });
};
//Submit submission for specific challenge
exports.create = function(req, res){
  //find the challenge
  Submission.findOne({_id: req.params.sid}, function(err, submission){
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
          if (!err){
            require("../models/activity.js").create(submission.ballots.id(newBallot.id));
            res.send(200, submission);
          } else {
            res.send(500, err);
          }
        });


      } else { //no challenge was returned
        res.send(404);
      }
    } else {
      res.send(500, err);
    }
  });
};



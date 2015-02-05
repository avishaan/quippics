var mongoose = require('mongoose');
var Submission = require("../models/submission.js");
var Ballot = require("../models/ballot.js");
var Challenge = require('../models/challenge.js');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var fs = require('fs');
var logger = require('../logger/logger.js');
var async = require('async');

//function for some debugging when necessary
// istanbul ignore next: unofficial debug route
exports.debug = function(req, res){
  logger.info("debugger function for ballot entered");
  res.send(200);
};

//get the array of submission id's that the user has voted on
exports.userVotedSubmissions = function(req, res){
  // istanbul ignore if: incorrect input
  if (!isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission
  .find({'ballots.voter': req.params.uid})
  .select('_id owner')
  .lean()
  .exec(function(err, submissions){
    if (!err && submissions.length){
      //return only as a list of submission ids
      return res.send(200, submissions);
      // istanbul ignore else: db error
    } else if (!err){
      return res.send(200, {clientMsg: "Could not find any voted submissions for that user"});
    } else {
      return res.send(500, err);
    }
  });
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
      select: 'owner ballots'
    })
    //.select('submissions.ballots')
    .where('submissions')//where voter id equals the uid passed in
    .exec(function(err, challenge){
      if (!err && challenge){
        //todo, this is all async and should be a proper query
        var votedSubmissions = [];
        challenge.submissions.forEach(function(submission){
          //if the submission owner is the passed in ballot, add to voted array to prevent voting
          if (submission.owner.toString() === req.params.uid){
            votedSubmissions.push(submission.id);
            //since this is the user's submission and they can't vote return and don't bother looking at ballots
            return;
          }
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
//Submit vote for specific submission V2 allowing revotes
exports.vote = function(req, res){
  //find the challenge
  // istanbul ignore if: incorrect input
  if (!isObjectId(req.body.voter) ||
      !validator.isNumeric(req.body.score) ||
      !isObjectId(req.params.sid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  async.waterfall([
  function(cb){
    // find the submission we are voting on
    Submission
    .findOne({ _id: req.params.sid })
    .lean()
    .exec(function(err, submission){
      if (!err && submission){
        cb(null, submission);
      } else {
        cb({ err: err, clientMsg: 'Could not find submission' });
      }
    });
  },
  function(submission, cb){
    var ballots = submission.ballots;
    var votes = null; // array which stores existing ballot if we have already voted
    // check if the user has already voted
    if (ballots.length){
      votes = ballots.filter(function(ballot){
        return req.body.voter === ballot.voter.toJSON();
      });
    }
    cb(null, submission, votes);
  },
  function(submission, votes, cb){
    // if the user has voted, remove ballot, otherwise ignore
    if (votes){
      // incase there are multiple votes for this one user
      // go into the database and remove each occurance
      Submission
      .findOneAndUpdate(
        { _id: req.params.sid },
        { $pull: { ballots: { _id: votes[0]._id, score: votes[0].score }}},
        function(err, updated){
          // setImmediate(cb, err, submission);
          // cb(err, submission);
          cb(err, submission);
        });
    } else {
      cb(null, submission);
    }
  },
  function(submission, cb){
    // go into database and add new ballot to submission
    var newBallot = new Ballot({
      voter: req.body.voter,
      score: req.body.score
    });
    Submission
    .findOne({ _id: req.params.sid }, function(err, submission){
      if (!err && submission){
        submission.ballots.push(newBallot);
        submission.save(function(err, submission){
          if (!err && submission){
            cb(null, submission, newBallot);
          } else {
            cb({ err: err, clientMsg: 'Could not add ballot'});
          }
        });
      } else {
        cb({ err: err, clientMsg: 'Could not add ballot'});
      }
    });
  },
  function(submission, newBallot, cb){
    // add the activity
    // in order for the activity create to work, we need mongoose ballot document
    require("../models/activity.js").create(submission.ballots.id(newBallot.id));
    cb(null, newBallot);
  },
  ], function(err, ballot){
    // respond to the front end
    if (!err){
      res.send(200, {
        score: ballot.score,
        voter: ballot.voter.toJSON()
      });
    } else {
      logger.error(err);
      res.send(500, err);
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

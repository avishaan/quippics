var Challenge = require('../models/challenge.js');
var Submission = require('../models/submission.js');
var _ = require('underscore');
var perPage = 24; //submission per page

//read a specific submission
exports.readOne = function(req, res){
  //find the submission
  Submission.findOne({_id: req.params.sid}, function(err, submission){
    if (!err){ //no error
      if (submission){ //we found a submission by that id
        res.send(200, submission);
      } else { //found nothing by that id
        res.send(404);
      }
    } else { //some sort of error encountered
      res.send(500, err);
    }
  });
};
exports.readTop = function(req, res){
  Challenge
    .findOne({_id: req.params.cid})
    .populate({
      path: 'submissions',
      select: '-ballots' //don't return the ballots, we don't need it
    })
    .exec(function(err, challenge){
      if (!err){
        //TODO could use aggregation framework for this instead
        challenge.topSubmission(challenge, function(err, submission){ //return the top submission from the challenge
          if (!err){
            //find the submission again and populate the username this time
            Submission
              .findOne({_id: submission._id.toJSON()})
              .select('-ballots')
              .populate({
                path: 'owner',
                select: 'username'
              })
              .exec(function(err, submission){
                submission = submission.toJSON();
                //make the username the owner value instead of the complex object
                submission.owner = submission.owner.username;
                res.send(200, submission);
              });
          } else if (!submission){
            res.send(404, err);
          }
          else {
            res.send(500, err);
          }
        });
      } else {
        console.log(err);
        res.send(500, err);
      }
    });
}
//read challenge of a specific user
exports.userSubmission = function(req, res){
  //make sure we are looking at the right challenge, we only want to know for a specific challenge
  Challenge
    .findOne({_id: req.params.cid})
    .populate('submissions')
    .exec(function(err, challenge){
      challenge.submissions.some(function(submission, index, submissions){
        //go through all the submission owners until you find my submission
        //return that and stop the some (vs forEach) by returning something true
        if (submission.owner.toString() === req.params.uid){
          submission.getRank(function(rank){
            //need to make json object since we can't add rank directly to model
            //TODO need to fix this
            var submissionObj = submission.toJSON();
            submissionObj.rank = rank;
            return res.send(200, submissionObj);
          });
          return true; //this will stop 'some' from running otherwise eventually the elseif will still hit
        } else if ((index + 1) === submissions.length){
          //if we get to the end of the array and didn't find a match, send a not found back
          res.send(404, {clientMsg: "This user doesn't have a submission here"});
        }
      });
    });
};
//Read all the challenge in a submission
exports.readAll = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  //find all the submissions for a specific challenge
  Challenge
    .findById(req.params.cid)
    .sort('createdOn')
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    .populate({
      path: 'submissions',
      select: '-image'
    })
    .exec(function(err, challenge){
      if (!err){
        if (challenge){
          res.send(200, challenge.submissions);
        } else {
          res.send(404);
        }
      } else {
        res.send(500, err);
      }
    });
};
//Submit submission for specific challenge
exports.create = function(req, res){
  //see if the owner already has submitted a challenge here
  Challenge
    .findOne({_id: req.params.cid})
    .populate({
      path: 'submissions',
      select: 'owner',
      match: {owner: req.body.owner}
    })
    .exec(function(err, challenge){
      //if the length of the populated submissions array is one it means the user has already made a submission
      if (challenge.toJSON().submissions.length === 1){
        res.send(409, {clientMsg: "You have already submitted. You can't submit again"});
      } else { //user hasn't submitted, go ahead and let him make his submission
        //find the challenge
        Challenge
          .findOne({_id: req.params.cid})
          .exec(function(err, challenge){
            if (!err){
              if (challenge){
                //we found the challenge, let's create the new submission from the passed in parameters
                var newSubmission = new Submission();
                //add the challenge id to the submission
                newSubmission.challenge = challenge.id;
                //populate the image of the submission
                //we need to get the image information into our model
                //get one of the files uploaded //todo, there should only be one
                //if a file wasn't uploaded //todo, take out for production
                newSubmission.addImage(req, function(){
                  //get the owner information
                  newSubmission.owner = req.body.owner;
                  //save the submission first, we need to get the id back from the save so we can store it in our list of submissions in the challenge model
                  newSubmission.save(function(err, submission){
                    if (!err){
                      //put the submission id in our array of submissions
                      challenge.submissions.push(submission._id);
                      //now we have to save the challenge
                      challenge.save(function(err, challenge){
                        if (!err){
                          res.send(200, submission);
                        } else {
                          res.send(500, err);
                        }
                      });
                    } else {
                      res.send(500, err);
                    }
                  });
                });
              } else { //no challenge was returned
                res.send(404);
              }
            } else {
              res.send(500, err);
            }
          });
      }
    });
};

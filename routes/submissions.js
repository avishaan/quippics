var Challenge = require('../models/challenge.js');
var Submission = require('../models/submission.js');
var User = require('../models/user.js');
var _ = require('underscore');
var async = require('async');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var perPage = 24; //submission per page

//flag a submission
exports.removeFlagged = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.sid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission.removeFlagged({
    submissionId: req.params.sid
  }, function(err, submission){
    if (!err && submission){
      return res.send(200, {clientMsg: 'Submission removed from system'});
    } else {
      return res.send(500, err);
    }
  });
};
//flag a submission
exports.flag = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.sid) ||
      !isObjectId(req.body.flagger)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission.flag({
    submissionId: req.params.sid,
    flagger: req.body.flagger
  }, function(err){
    if (!err){
      return res.send(200, {clientMsg: 'Submission was flagged!'});
    } else {
      return res.send(500, err);
    }
  });
};
//read a specific submission
exports.readOne = function(req, res){
  //find the submission
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.sid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  async
  .parallel([
    function(cb){
      // get the main submission we are looking for
      Submission
      .findOne({_id: req.params.sid})
      .populate({
        path: 'comments.commenter',
        select: 'username'
      })
      .populate({
        path: 'challenge',
        select: 'title description tags'
      })
      .populate({
        path: 'owner',
        select: 'username'
      })
      .lean()
      .exec(function(err, submission){
        cb(err, submission);
      });
    },
    function(cb){
      // get the next submission we are looking for
      Submission
      .find({_id: {$gt: req.params.sid}})
      .limit(1)
      .sort({'_id': 1})
      .select('_id')
      .exec(function(err, submission){
        cb(err, submission);
      });
    },
    function(cb){
      // get the previous submission we are looking for
      Submission
      .find({_id: {$lt: req.params.sid}})
      .limit(1)
      .sort({'_id': -1})
      .select('_id')
      .exec(function(err, submission){
        cb(err, submission);
      });
    }
  ],
  function(err, results){
    // make sure the first submission exists, if not then send 404
    if (!err){
      if (results[0]){
        var submission = results[0];
        // before sending the array, add the prev and next first
        submission.nextSubmission = results[1][0] ? results[1][0].id : null;
        submission.prevSubmission = results[2][0] ? results[2][0].id : null;
        return res.send(200, submission);
      } else {
        // we didn't get anything back
        return res.send(404), {clientMsg: "Couldn't find this submission, try again"};
      }
    } else {
      // we had an error
      return res.send(500, err);
    }
  });
};
exports.readTop = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .findOne({_id: req.params.cid})
    .populate({
      path: 'submissions',
      select: '-ballots' //don't return the ballots, we don't need it
    })
    .exec(function(err, challenge){
      // istanbul ignore else: db error
      if (!err){
        //TODO could use aggregation framework for this instead
        challenge.topSubmission(challenge, function(err, submission){ //return the top submission from the challenge
          // istanbul ignore else: db error
          if (!err && submission){
            //find the submission again and populate the username this time
            Submission
              .findOne({_id: submission._id.toJSON()})
              .select('-ballots')
              .populate({
                path: 'owner',
                select: 'username'
              })
              .exec(function(err, submission){
                if (!err && submission){
                  submission = submission.toJSON();
                  //make the username the owner value instead of the complex object
                  submission.owner = submission.owner.username;
                  return res.send(200, submission);
                // istanbul ignore else: db error
                } else if(!err){
                  //TODO check the validity of this route
                  //this means there is no top submission
                  return res.send(200, {});
                } else {
                  return res.send(500, err);
                }
              });
          } else if (!submission){
            return res.send(404, {clientMsg: "Couldn't find any top challenges"});
          } else {
            return res.send(500, err);
          }
        });
      } else {
        return res.send(500, err);
      }
    });
};
//read all submissions of specific user in a challenge
exports.readUserSubmissions = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  //make sure we are looking at the right challenge, we only want to know for a specific challenge
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
      !validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .findOne({_id: req.params.cid})
    .select('submissions title tags')
    .populate({
      path: 'submissions',
      select: 'owner thumbnail _id id challenge owner comments.id comments._id image.url createdOn',
      options: {
        sort: 'createdOne',
        skip: perPage * (req.params.page -1 ),
        limit: (perPage)
      },
      match: { owner: req.params.uid }
    })
    .exec(function(err, challenge){
      if (!err && challenge && challenge.submissions && challenge.submissions.length){
        // send the submissions back to the front end.
          Submission.populate(challenge.submissions, {
            path: 'owner',
            select: 'username'
          }, function(err, submissions){
            if (!err) {
              return res.send(200, challenge.toJSON({getters: true}));
            } else {
              return res.send(500, err);
            }
          });
      } else {
        // as per gh#120 send empty array
        res.send(404, {
          submissions: []
        });
      }
    });
};
//read submission of a specific user
exports.userSubmissionV2 = function(req, res){
  //make sure we are looking at the right challenge, we only want to know for a specific challenge
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .findOne({_id: req.params.cid})
    .populate({
      path: 'submissions',
      select: ''
    })
    .exec(function(err, challenge){
      if (!err && challenge){
        challenge.submissions.some(function(submission, index, submissions){
          //go through all the submission owners until you find my submission
          //return that and stop the some (vs forEach) by returning something true
          if (submission.owner.toString() === req.params.uid){
            submission.getRank(function(rank){
              //need to make json object since we can't add rank directly to model
              //TODO need to fix this
              var submissionObj = submission.toJSON();
              submissionObj.rank = rank;
              submissionObj.commentCount = submissionObj.comments.length;
              return res.send(200, submissionObj);
            });
            return true; //this will stop 'some' from running otherwise eventually the elseif will still hit
          } else if ((index + 1) === submissions.length){
            //if we get to the end of the array and didn't find a match, send a not found back
            return res.send(404, {clientMsg: "This user doesn't have a submission here"});
          }
        });
      // istanbul ignore else: db error
      } else if (!challenge){
        return res.send(404, {clientMsg: "This user doesn't have a submission here"});
      } else {
        return res.send(500, err);
      }
    });
};
//read submission of a specific user
exports.userSubmission = function(req, res){
  //make sure we are looking at the right challenge, we only want to know for a specific challenge
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .findOne({_id: req.params.cid})
    .populate({
      path: 'submissions',
      select: ''
    })
    .exec(function(err, challenge){
      if (!err && challenge){
        challenge.submissions.some(function(submission, index, submissions){
          //go through all the submission owners until you find my submission
          //return that and stop the some (vs forEach) by returning something true
          if (submission.owner.toString() === req.params.uid){
            submission.getRank(function(rank){
              //need to make json object since we can't add rank directly to model
              //TODO need to fix this
              var submissionObj = submission.toJSON();
              submissionObj.rank = rank;
              submissionObj.commentCount = submissionObj.comments.length;
              return res.send(200, submissionObj);
            });
            return true; //this will stop 'some' from running otherwise eventually the elseif will still hit
          } else if ((index + 1) === submissions.length){
            //if we get to the end of the array and didn't find a match, send a not found back
            return res.send(404, {clientMsg: "This user doesn't have a submission here"});
          }
        });
      // istanbul ignore else: db error
      } else if (!challenge){
        return res.send(404, {clientMsg: "This user doesn't have a submission here"});
      } else {
        return res.send(500, err);
      }
    });
};
//Return submission image data
exports.readImage = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.sid)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission
    .findOne({_id: req.params.sid})
    .exec(function(err, submission){
      // istanbul ignore else: db error
      if (!err){
        if (submission){
          res.writeHead(200, {'Content-Type': submission.image.contentType});
          return res.end(submission.image.data);
        } else {
          return res.send(404, {clientMsg: "No Submissions in Challenge Found"});
        }
      } else {
        return res.send(500, err);
      }
    });
};
//Read all the challenge in a submission
exports.readAll = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  //find all the submissions for a specific challenge
  // istanbul ignore if: bad request
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.cid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
      // istanbul ignore else: db error
      if (!err){
        if (challenge && challenge.submissions.length){
          return res.send(200, challenge.submissions);
        } else {
          return res.send(404, {clientMsg: "No Submissions in Challenge Found"});
        }
      } else {
        return res.send(500, err);
      }
    });
};

//Read all (V2) the challenge in a submission
exports.readAllV2 = function(req, res){
  //find all the submissions for a specific challenge
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .findById(req.params.cid)
    .sort('createdOn')
    .select('submissions title tags')
    .populate({
      path: 'submissions',
      select: '_id id challenge owner comments.id comments._id image.url'
    })
    .exec(function(err, challenge){
      // istanbul ignore else: db error
      if (!err){
        if (challenge && challenge.submissions.length){
          Submission.populate(challenge.submissions, {
            path: 'owner',
            select: 'username'
          }, function(err, submissions){
            if (!err) {
              console.log(challenge.submissions[0].image.url);
              return res.send(200, challenge.toJSON({getters: true}));
            } else {
              return res.send(500, err);
            }
          });
        } else {
          return res.send(404, {clientMsg: "No Submissions in Challenge Found"});
        }
      } else {
        return res.send(500, err);
      }
    });
};
//Submit submission for specific challenge
exports.createV2 = function(req, res){
  //see if the owner already has submitted a challenge here
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
      !isObjectId(req.body.owner)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .findOne({_id: req.params.cid})
    .populate({
      path: 'submissions',
      select: 'owner',
      match: {owner: req.body.owner}
    })
    .exec(function(err, challenge){
      if (!err) { //user hasn't submitted, go ahead and let him make his submission
        //find the challenge
        Challenge
          .findOne({_id: req.params.cid})
          .exec(function(err, challenge){
            // istanbul ignore else: db error
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
                    // istanbul ignore else: image error
                    if (!err){
                      //put the submission id in our array of submissions
                      challenge.submissions.push(submission._id);
                      //now we have to save the challenge
                      challenge.save(function(err, challenge){
                        // istanbul ignore else: db error
                        if (!err){
                          //add a related submission activity
                          require('../models/activity.js').create(submission);
                          return res.send(200, submission);
                        } else {
                          return res.send(500, err);
                        }
                      });
                    } else {
                      return res.send(500, err);
                    }
                  });
                });
              } else { //no challenge was returned
                return res.send(404, {clientMsg: "Could not find a challenge at this id"});
              }
            } else {
              return res.send(500, err);
            }
          });
      } else {
        return res.send(500, err);
      }
    });
};
//Submit submission for specific challenge
exports.create = function(req, res){
  //see if the owner already has submitted a challenge here
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
      !isObjectId(req.body.owner)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
        return res.send(409, {clientMsg: "You have already submitted. You can't submit again"});
      // istanbul ignore else: db error
      } else if(!err) { //user hasn't submitted, go ahead and let him make his submission
        //find the challenge
        Challenge
          .findOne({_id: req.params.cid})
          .exec(function(err, challenge){
            // istanbul ignore else: db error
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
                    // istanbul ignore else: image error
                    if (!err){
                      //put the submission id in our array of submissions
                      challenge.submissions.push(submission._id);
                      //now we have to save the challenge
                      challenge.save(function(err, challenge){
                        // istanbul ignore else: db error
                        if (!err){
                          //add a related submission activity
                          require('../models/activity.js').create(submission);
                          return res.send(200, submission);
                        } else {
                          return res.send(500, err);
                        }
                      });
                    } else {
                      return res.send(500, err);
                    }
                  });
                });
              } else { //no challenge was returned
                return res.send(404, {clientMsg: "Could not find a challenge at this id"});
              }
            } else {
              return res.send(500, err);
            }
          });
      } else {
        return res.send(500, err);
      }
    });
};

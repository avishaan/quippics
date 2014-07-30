var mongoose = require('mongoose');
var Comment = require("../models/comment.js");
var Submission = require("../models/submission.js");
var User = require("../models/user.js");
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;


//Read all the comments for a specific submission
exports.readAll = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.sid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission
    .findOne({_id: req.params.sid})
    .select('comments')
    .populate({
      path: 'comments.commenter',
      select: 'username thumbnail'
    })
    .exec(function(err, submission){
      // istanbul ignore else: db error
      if (!err){
        if (submission){
          return res.send(200, submission.comments);
        } else {
          return res.send(404, {clientMsg: "Could not find a submission with that id"});
        }
      } else {
        return res.send(500, err);
      }
    });
};

//Create a new comment for as specific submission
exports.create = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.body.commenter) ||
      !validator.isAscii(req.body.comment) ||
      !isObjectId(req.params.sid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission
    .findOne({_id: req.params.sid})
    .select('comments owner _id')
    .exec(function(err, submission){
      // istanbul ignore else: db error
      if (!err){
        if (submission){
          //we use create of instance subdoc instead of the normal new so that an id is assigned right away as well as validation
          var comment = submission.comments.create({
            comment: req.body.comment,
            commenter: req.body.commenter
          });
          submission.comments.push(comment); //add comment to end of array of comments
          submission.save(function(err, newSubmission){
            if(!err && newSubmission){
              require("../models/activity.js").create(comment);
              return res.send(200, comment);
            // istanbul ignore else: db error
            } else if(!err){
              return res.send(404, {clientMsg: "Couldn't save comment"});
            } else {
              return res.send(500, err);
            }
          });
        } else {
          return res.send(404, {clientMsg: "Could not find submission with that id"});
        }
      } else {
        return res.send(500, err);
      }
    });
};

//Read one comment for a specific submission
exports.readOne = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.comid) ||
      !isObjectId(req.params.sid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Submission
    .findOne({_id: req.params.sid})
    .exec(function(err, submission){
      // istanbul ignore else: db error
      if (!err){
        if (submission.comments.id(req.params.comid)){
          return res.send(200, submission.comments.id(req.params.comid));
        } else {
          return res.send(404, {clientMsg: "Could not find comment"});
        }
      } else {
        return res.send(500, err);
      }
    });
};

var mongoose = require('mongoose');
var Comment = require("../models/comment.js");
var Submission = require("../models/submission.js");
var User = require("../models/user.js");


//Read all the comments for a specific submission
exports.readAll = function(req, res){
  Submission
    .findOne({_id: req.params.sid})
    .select('comments')
    .populate({
      path: 'comments.commenter',
      select: 'username thumbnail'
    })
    .exec(function(err, submission){
      if (!err){
        if (submission){
          res.send(200, submission.comments);
        } else {
          res.send(404);
        }
      } else {
        res.send(200, err);
      }
    });
};

//Create a new comment for as specific submission
exports.create = function(req, res){
  Submission
    .findOne({_id: req.params.sid})
    .select('comments owner _id')
    .exec(function(err, submission){
      if (!err){
        if (submission){
          //we use create of instance subdoc instead of the normal new so that an id is assigned right away as well as validation
          var comment = submission.comments.create({
            comment: req.body.comment,
            commenter: req.body.commenter
          });
          submission.comments.push(comment); //add comment to end of array of comments
          submission.save(function(err, newSubmission){
            if(!err){
              require("../models/activity.js").create(comment);
              res.send(200, comment);
            } else {
              res.send(500, err);
            }
          });
        } else {
          res.send(404);
        }
      } else {
        res.send(500);
      }
    });


};

//Read one comment for a specific submission
exports.readOne = function(req, res){
  Submission
    .findOne({_id: req.params.sid})
    .exec(function(err, submission){
      if (!err){
        if (submission.comments.id(req.params.comid)){
          res.send(200, submission.comments.id(req.params.comid));
        } else {
          res.send(404);
        }
      } else {
        res.send(500, err);
      }
    });
};

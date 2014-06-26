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
          var comment = new Comment();
          comment.comment = req.body.comment;
          comment.commenter = req.body.commenter;
          submission.comments.push(comment); //add comment to end of array of comments
          submission.save(function(err, newSubmission){
            if (!err){
             User
                .findOne({_id: req.body.commenter})
                .select('username thumbnail')
                .exec(function(err, user){
                  if (!err){
                    res.send(200, 
                      {comment: req.body.comment,
                        _id: newSubmission.comments[newSubmission.comments.length-1].toJSON()._id.toJSON(),
                        date: Date.now(),
                        commenter: {
                          username: user.toJSON().username,
                          thumbnail: user.toJSON().thumbnail
                        }
                    });
                  } else {
                    res.send(404);
                  }
                });

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

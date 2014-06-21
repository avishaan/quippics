var Challenge = require('../models/challenge.js');
var perPage = 24; //submission per page

//Submit submission for specific challenge
exports.create = function(req, res){
  //see if the owner already has submitted a challenge here
  Challenge
    .findOne({_id: req.params.id})
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
          .findOne({_id: req.params.id})
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

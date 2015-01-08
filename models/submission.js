var mongoose = require("mongoose");
var fs = require('fs');
var _ = require('underscore');
var Challenge = require('../models/challenge.js');
var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Ballot = require('../models/ballot.js');
var Comment = require("../models/comment.js");
var async = require('async');
var logger = require('../logger/logger.js');
var config = require('../conf/config.js');
var mailers = require('../mail/mailers.js');

var submissionSchema = new mongoose.Schema({
  createdOn: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  //these are users who are invited at the creation of the submission
  image: {
    data: Buffer,
    contentType: String,
    url: { type: String, get: urlFormatter }
  },
  thumbnail:
  { data: Buffer, contentType: String },
  ballots: [Ballot.schema],
  flaggers: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' } //list of users who have flagged the submission
  ],
  comments: [Comment.schema],
  score: { type: Number, default: 0}, //we calculate this in the pre save
  rank: { type: Number, default: 0}, //this should be calculated before every ballot added
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge"} //we save the challenge id of each submission for easy querying
});

//do the following before each save
submissionSchema.pre('save', function(next){ //right before saving a new submission, make a new entry in the activity collection
  this.wasNew = this.isNew; //we use this in the post 'save' hook since it has no way to let us know if a doc is/was new

  if (typeof this.ballots !== "undefined" && this.isModified()){ //if there are ballots in the submission
    //calculate the average score
    var tot = 0;
    this.ballots.forEach(function(element){
      tot += element.score;
    });
    //calculate and store the score in the document //TODO, this should be done only when a ballot is added, not just a submission
    this.score = tot/this.ballots.length;
    next();
  } else {
    next();
  }
});

//do following during flag event/hook
submissionSchema.on('flag', function(){
  console.log('FLAG');
});

//do the following after each successful save
submissionSchema.post('save', function(){
  if (this.wasNew){
    //emit the specific wasNew event
    this.emit('new');
  } else {
    this.emit('update');
  }
});

//do the following after save on new instance
submissionSchema.post('new', function(){
  var submission = this;
  //populate the challenge info from the submission
  //TODO add error handling
  submission.populate({
    path: 'challenge',
    select: 'owner title'
  }, function(err, submission){
    //lookup challenge for submission
    if (err){

    }
    Challenge.aggregate(
      {$project: {participants: 1}},
      {$match: {_id: submission.challenge._id}},
      {$unwind: "$participants"},
      {$match: {'participants.inviteStatus': {$in: ['invited', 'accepted']}}},
      {$project: {
        inviteStatus: '$participants.inviteStatus',
        user: '$participants.user'
      }}
    ).exec(function(err, participants){
      if (err){

      }
      //we have all users that have either accepted or invited to challenge, notify!
      //put returned participants into an array of userids converted to string
      var users = _.map(participants, function(user){return user.user.toString();});
      //add the owner of the challenge to the list
      users.push(submission.challenge.owner.toString());
      //remove the submitter of the challenge from the list
      users = _.difference(users, submission.owner.toString());
      //we need to convert the strings back to objectids
      users = _.map(users, function(user){return mongoose.Types.ObjectId(user);});
      User.sendNotifications({
        users: users,
        payload: {
          alert: {
            'body': 'A new submission was made!',
            'action-loc-key': 'look at submission'
          },
          body: {
            'type': 'submission',
            '_id': submission._id,
            'title': submission.challenge.title,
            'challenge': {
              'id': submission.challenge.id,
              'title': submission.challenge.title
            }
          }
        }
      }, function(err){
        if (err){
          logger.error("Error! ", {err: err, stack: new Error().stack});
        }
      });
    });
  });
});

//keep submission
submissionSchema.statics.keepFlagged = function(options, cb){
  var submissionId = options.submissionId;
  logger.info('keeping flagged submission');
  cb(null);
};
//remove submission
submissionSchema.statics.removeFlagged = function(options, cb){
  var submissionId = options.submissionId;
  var submissionDoc;
  logger.info('removing flagged submission');
  async.series([
    function(done){
      //remove the submission
      //TODO consider not removing incase there is some left over reference to it
      Submission
      .findOneAndRemove({_id: submissionId})
      .select('_id owner challenge')
      .populate({
        path: 'owner',
        select: 'id email _id'
      })
      .lean()
      .exec(function(err, submission){
        if (!err && submission){
          //hold on to the doc, we need it for other stuff
          submissionDoc = submission;
          done(null);
        } else if (err){
          err.clientMsg = 'Couldnt find and/or remove submission';
        } else {
          var err = {};
          err.clientMsg = 'Couldnt find and/or remove submission';
          done(err);
        }
      });
    },
    function(done){
      //send email to user
      mailers.mailUserTerms({
        email: submissionDoc.owner.email,
      });
      done(null);
    },
    function(done){
      //clean up the challenge, remove submission from challenge, remove user from challenge
      //find the challenge
      Challenge
      .findOne({_id: submissionDoc.challenge})
      .select('submissions invites participants')
      .exec(function(err, challenge){
        //remove submission from challenge
        challenge.submissions.pull(submissionId);
        //remove user from invites
        challenge.invites.pull(submissionDoc.owner._id.toString());
        //remove user from participants
        challenge.participants.forEach(function(val, index){
          if (val.user.equals(submissionDoc.owner._id)){
            //if user matches, remove subdoc at index and exit loop
            challenge.participants.splice(index, 1);
            return true;
          }
          return false;
        });
        challenge.save(function(err, savedChallenge){
          if (!err){
            done(null);
          } else {
            err.clientMsg = 'Couldnt remove submission from challenge';
            done(err);
          }
        });
      });
    },
    function(done){
      var errors = [];
      //remove other comments from that user in other submissions in that challenge
      Submission
      .find({'comments.commenter': submissionDoc.owner._id.toString(),
             'challenge': submissionDoc.challenge}) //match only in that challenge, not all challenges
      .select('comments challenge')
      .exec(function(err, submissions){
        if (!err && submissions && submissions.length){
          //go through each submission in the challenge
          submissions.forEach(function(submission, index){
            //in each submission check all the comments
            submissions[index].comments.forEach(function(comment, cindex){
              //check each comment for a user match, if so remove/splice that
              if (comment.commenter.equals(submissionDoc.owner._id)){
                //if this is a comment of the kicked commenter, remove it
                submissions[index].comments.splice(cindex, 1);
              }
            });
            //save each submission
            //TODO only save the modified ones
            submissions[index].save(function(err){
              if (err){
                //since we have multiple saves, add to error array
                errors.push(err);
              }
            });
          });
          if (errors.length === 0){
            //no errors in the process, lets finish up here
            done(null);
          } else {
            //we had some errors after all that
            done(null)
            //done(errors);
          }
        } else if (!err) {
          logger.debug('Didnt remove any comments');
          done(null);
        } else {
          err.clientMsg = 'Didnt remove any comments';
          logger.error('Error removing comments');
          done(null);
          //done(err);
        }
      });
    },
    function(done){
      //increment user badSubmissions value
      User
      .findOne({_id: submissionDoc.owner._id})
      //TODO the email here is need 2 fncs later by user.ban, fix this
      .select('id _id email badSubmissions')
      .exec(function(err, user){
        if (!err && user){
          user.incrementBadSubmissions(function(err){
            if (!err){
              done(null);
            } else {
              done(err);
            }
          });
        } else if (err) {
          err.clientMsg = 'Couldnt find user to increment';
          done(null);
        } else {
          var err = {};
          err.clientMsg = 'Couldnt find user to increment';
          done(null);
        }
      });
    },
    function(done){
      //remove the submission activities regarding that submission
      Activity
      .find({'references.submission':submissionDoc._id})
      .remove()
      .exec(function(err, activities){
        if (err){
          //if error, let it proceed to next step just let the server know
          logger.error('Error! Could not delete activities', {err: err, stack: new Error().stack});
        }
        done(null);
      });
    },
    function(done){
      //remove the comments activities regarding that user in that challenge 
      Activity
      .find({
        'references.challenge': submissionDoc.challenge,
        'subject': submissionDoc.owner._id
      })
      .remove()
      .exec(function(err, activities){
        if (err){
          //if error, let it proceed to next step just let the server know
          logger.error('Error! Could not delete activities', {err: err, stack: new Error().stack});
        }
        done(null);
      });
    }],
    function(err, results){
      if (!err){
        logger.info('Removed submission:', submissionDoc._id.toString(), ' and all references to it');
        cb(null);
      } else {
        logger.error('Error! Could not properly cleanup submission: ', submissionDoc, {err: err, stack: new Error().stack});
        cb(err);
      }

  });
};
//flag submission
submissionSchema.statics.flag = function(options, cb){
  var submissionId = options.submissionId;
  var flaggerId = options.flagger;
  async.waterfall([
    function(done){
      //first add flagger to submission
      Submission
      .findOne({_id: submissionId})
      .select('challenge _id flaggers owner image thumbnail')
      .populate({
        path: 'owner',
        select: 'email username'
      })
      .exec(function(err, submission){
        if (!err && submission){
          submission.flaggers.addToSet(flaggerId);
          submission.save(function(err, savedSubmission){
            if (!err && savedSubmission){
              done(null, savedSubmission);
            } else {
              done(err, null);
            }
          });
        } else {
          done(err, null);
        }
      });
    },
    function(submission, done){
      //check if past flag threshold and send email if that is the case
      if (submission.flaggers.length >= config.flagThreshold){
        logger.info('Submission past flag threashold: %d', config.flagThreshold);
        //populate the fields needed for sending in the email
        //send out an email to the moderator giving information on the bad submission
        mailers.moderateSubmission({
          flaggedUserEmail: submission.owner.email,
          image: submission.image,
          challengeId: submission.challenge.toString(),
          submissionId: submission.id
        });
      }
      done(null);
    }
  ], function(err, reslts){
    //handle the errors here
    if (!err){
      cb(null);
    } else {
      cb(err);
    }
  });
};
//find challenge of a submission //TODO, we already store this, why the hell are we looking for it!?
submissionSchema.methods.findChallenge = function(next){
  //find the challenge this submissions exists in and pass that to the callback
  Challenge
    .findOne({submissions: this._id})
    .populate({
      path: 'submissions', //populate submissions in the challenge
      select: 'score' //but only select submissions.score as that is all we will need
    })
    .select('submissions')//also only pass back challenge.submissions, we don't need the other challenge props
    .exec(function(err, challenge){
      if (!err && challenge){
        next(null, challenge);
      } else {
        next(err, null);
      }
    });
};

//calculate the rank of an image
submissionSchema.methods.getRank = function(next){
  //we have a virtual that we use to get the rank of the submission
  var submission = this; //keep this for when context changes
  //find the challenge this submission belongs to so we can get all the submissions in the group
  this.findChallenge(function(err, challenge){
    if (!err && challenge){
      //sort the submissions in this challenge ordering by 'score'
      var sortedSubmissions = _.sortBy(challenge.toJSON().submissions, 'score'); //sort in ascending order by score
      sortedSubmissions = _.chain(sortedSubmissions).reverse().value(); //reverse the order so it is in descending order
      //now find where our submissions is in this sorted list
      var index = _.chain(sortedSubmissions).map(function(obj){
        return obj._id.toJSON(); //need to get the string version of the id
      }).indexOf(submission.id).value(); //find the index of the submission in the ordered array that matches the submission we are looking for
      //return that place in the ranking
      next(index + 1); //add one to the index to get the rank
    } else {
      next(-1); //some sort of error to investigate
    }
  });
};

//help addImage to a submission
submissionSchema.methods.addImage = function(req, next){
  var gm = require('gm');
  var im = gm.subClass({ imageMagick: true });
  if (req.files){ //see if there are files first //TODO, this may not be a good way to see if files are there
    var uploadedImage = req.files[Object.keys(req.files)[0]]; //get the first file in the list of files
    this.image.contentType = uploadedImage.type;
    this.image.data = fs.readFileSync(uploadedImage.path); //TODO, this should be async, this is blocking and slow
    //TODO cleanup this file also
    //make the thumbnail too
    var thumbPath = uploadedImage.path + "thumb"; //set thumb path for future use
    var that = this;
    im(uploadedImage.path).thumb(90, 90, thumbPath, 90, //should go in own addThumbnail function
      function(err, stdout, stderr, command){
        that.thumbnail.contentType = uploadedImage.type;
        that.thumbnail.data = fs.readFileSync(thumbPath);
        next();
      });

  } else {
    next();
  }
};
// smart url formatting, if external resource exists use that otherwise pull from db
function urlFormatter (url) {
  var submission = this;
  if (!url) {
    // no url, use the default route for the image url based on submission id
    // url changes based on env type
    if (config.env === 'local'){
      url = 'http://' + config.apiURL + ':' + config.expressPort + '/api/v2/submissions/' + submission.id + '/image.png';
    } else if (config.env === 'dev'){
      // in dev, send them the link to the unauthenticated routes
      url = 'http://' + config.apiURL + '/api/dev/submissions/' + submission.id + '/image.png';
    } else {
      // not local, don't include the port
      url = 'http://' + config.apiURL + '/api/v2/submissions/' + submission.id + '/image.png';
    }
  }
  return url;
};
//Build the submission model
var Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;

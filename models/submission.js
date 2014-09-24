var mongoose = require("mongoose");
var fs = require('fs');
var _ = require('underscore');
var Challenge = require('../models/challenge.js');
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
  image:
  { data: Buffer, contentType: String },
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

//post save check if the image has been successfully flagged
submissionSchema.post('save', function(){
  //if the submission was flagged by X or more people
  //sometimes the submission won't have the flaggers populated, in which case forget it
  if (this.flaggers && this.flaggers.length >= config.flagThreshold){
    //perform moderator actions and notifications
    logger.info('Submission past flag threashold: %d', config.flagThreshold);
    //populate the fields needed for sending in the email
    //send out an email to the moderator giving information on the bad submission
    mailers.moderateSubmission({
      flaggedUser: this.owner.email,
      image: this.image
    });
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
            'title': submission.challenge.title
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

//remove submission
submissionSchema.statics.removeFlagged = function(options, cb){
  var submissionId = options.submissionId;
  logger.info('removing flagged submission');
 // async.parallel([
 //   function(done){
 //   //remove the submission
 // },function(done){
 //   //remove the user from the challenge
 // },function(done){
 //   //remove the activities regarding that submission
 // }
 // ], function(results){

 // });
};
//flag submission
submissionSchema.statics.flag = function(options, cb){
  var submissionId = options.submissionId;
  var flaggerId = options.flagger;
  this
  .findOne({_id: submissionId})
  .select('_id flaggers owner image thumbnail')
  .exec(function(err, submission){
    if (!err && submission){
      submission.flaggers.addToSet(flaggerId);
      submission.save(function(err, savedSubmission){
        if (!err && savedSubmission){
          cb(null, savedSubmission);
        } else {
          cb(err, null);
        }
      });
    } else {
      cb(err, null);
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
//Build the submission model
var Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;

var mongoose = require('mongoose');
var _ = require('underscore');
var User = require('../models/user.js');

var challengeSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  tags: [ String ],
  createdOn: { type:Date, default: Date.now },
  expiration: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invites: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  participants: [
    { user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //reference to a user id
      inviteStatus: { type: String }, //lets us know if the user has 'invited', 'accepted', 'declined' the challenge
      hidden: { type: Boolean, default: false } //if this is true, then don't show in archive
    }
  ],
  submissions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Submission'}
  ],
  privacy: { type: String }
});

challengeSchema.pre('save', function(next){
  //plumbing so we can tell if a model is new in the post save
  this.wasNew = this.isNew;
  next();
});

challengeSchema.post('save', function(){
  if (this.wasNew){
    //emit the specific wasNew event
    this.emit('new');
  } else {
    this.emit('update');
  }
});

challengeSchema.post('new', function(){
  //put returned participants into an array of userids
  var users = _.pluck(this.participants, 'user');
  User.sendNotifications({
    users: users,
    payload: {
      alert: {
        'body': 'You are invited to a new Challenge!',
        'action-loc-key': 'challenge accepted!'
      },
      body: {
        'type': 'challenge',
        '_id': this._id,
        'title': this.title
      }
    }
  }, function(err){
    // istanbul ignore if: no error for notifications
    if (err){
      console.error("Error! ", err, new Error().stack);
    }
  });
});

//find the top submission in a challenge
challengeSchema.methods.topSubmission = function(challenge, cb){
  //find the top submission in the array of submission from the challenge
  var err = null; //TODO have some sort of error handling
  if (challenge.submissions.length === 0){ //if there are no submission in the challenge
    err = {clientMsg: "could not find top submission in challengeinstance.topSubmission"};
    return cb(err, null);
  }
  var submission = _.max(challenge.toJSON().submissions, function(submission){
    return submission.score;
  });

  return cb(err, submission);
};
//Build the challenge model
var Challenge = mongoose.model('Challenge', challengeSchema);
//export the Challenge module
module.exports = Challenge;

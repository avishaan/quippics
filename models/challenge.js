var mongoose = require('mongoose');
var _ = require('underscore');

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
      inviteStatus: { type: String } //lets us know if the user has 'invited', 'accepted', 'declined' the challenge
    }
  ],
  submissions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Submission'}
  ],
  privacy: { type: String }
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

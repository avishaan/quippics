var mongoose = require("mongoose");
/*
 |-------------------------------------------------------------
 | Activity Schema
 |-------------------------------------------------------------
 */

var activitySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},//subject in the sentence
  object: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},//object in sentence
  title: String,
  sentence: String, //sentence to help the frontend
  score: Number,
  modelType: String,
  reference: {type: mongoose.Schema.Types.ObjectId}, //we purposely didn't give it a reference, we will do that at query time
  references: { //in this situation we have the reference predefined which means that we need to place the reference activity in the correct place
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
    challenge: {type: mongoose.Schema.Types.ObjectId, ref: 'Challenge'},
    submission: {type: mongoose.Schema.Types.ObjectId, ref: 'Submission'},
    ballot: {type: mongoose.Schema.Types.ObjectId, ref: 'Ballot'}
  }
});

//create a sentence based on the activity on save
activitySchema.pre('save', function(next){
  if (this.isNew){
    //create a sentence for the FE to use before saving

  }
  next(); //regardless proceed next
});

activitySchema.methods.populateSentence = function(next){
    switch (this.modelType) {
      case ("Submission"):
        this.sentence = this.subject.username + " submitted into challenge, " + this.references.challenge.title;
        break;
      case ("Challenge"):
        this.sentence = this.subject.username + " created a challenge, " + this.references.challenge.title;
        break;
      case ("Comment"):
        this.sentence = this.subject.username + " commented on, " + this.object.username + "'s photo";
        break;
      case ("Ballot"):
        this.sentence = this.subject.username + " voted on, " + this.object.username + "'s photo in, " + this.references.challenge.title + " a " + this.score + "/10";
        break;
    }
  next(null); //we always go the next step since there is no point not to
};

activitySchema.statics.createSubmission = function (submission){
  var activity = new this();
  activity.modelType = 'Submission';
  activity.owner = submission.owner.toJSON();
  activity.subject = submission.owner.toJSON();
  //activity.reference = submission._id;
  activity.references.submission = submission._id;
  activity.references.challenge = submission.challenge;
  activity.save();
};

//helper method to create an Activity entry for every challenge created
activitySchema.statics.createChallenge = function(challenge){
  var activity = new this();
  activity.modelType = 'Challenge';
  //activity.owner = challenge.owner.toJSON();
  //activity.object = null;
  activity.subject = challenge.owner.toJSON();
  //activity.reference = challenge.id;
  activity.references.challenge = challenge.id;
  activity.save();
};

//helper method to create an Activity entry for a comment
activitySchema.statics.createComment = function(comment){
  var activity = new this();
  activity.subject = comment.commenter;
  activity.object = comment.__parent.owner;
  activity.modelType = 'Comment';
  //activity.reference = comment._id;
  activity.references.comment = comment._id;
  activity.references.submission = comment.__parent.id;
  activity.save();
};

//helper method to create a proper Activity entry for a ballot
activitySchema.statics.createBallot = function(ballot){
  var activity = new this();
  //In order to get the title, we have to run a ridiculous query on the challenge level
  //todo, find a better way to do this query, maybe have a parent id
  var Challenge = require("../models/challenge.js");
  Challenge.findOne({'submissions': {$in:[ballot.__parent._id]}}, function(err, challenge){
    activity.references.challenge = challenge._id; //find the challenge title and set the activity title to that.
    activity.modelType = 'Ballot';
    activity.score = ballot.score;
    activity.subject = ballot.voter;
    activity.object = ballot.__parent.owner;
    //activity.title = ;
    //activity.owner = ballot.voter; //set the activity owner to whoever did the voting
    //activity.reference = ballot._id; //set the activity reference id to the id of the ballot just created
    //activity.references.ballot = ballot._id;
    activity.references.submission = ballot.__parent.id; //we need the parent submission also since we won't be able to get the ballot directly and populate
    activity.save();
  });
};

//Build the Activity model
var Activity = mongoose.model('Activity', activitySchema);

//export this for the require section
module.exports = Activity;

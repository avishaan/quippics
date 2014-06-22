var mongoose = require('mongoose');

var ballotSchema = new mongoose.Schema({
  createdOn: { type: Date, default: Date.now },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  score: Number
});

ballotSchema.pre('save', function(next){ //right before saving a new ballot, make a new entry in the activity collection
  if (this.isNew && this.isModified()){
    //TODO better way to use activity's
    //Activity.createBallot(this); //create activity entry for this
    var submission = this.parent(); //parent of the ballot subdoc is the submission
    //now is a good time to calculate a ranking
    submission.getRank(function(rank){
      submission.rank = rank;
      next();
    });
  } else {
    next();
  }
});
//Build the Ballot model
var Ballot = mongoose.model('Ballot', ballotSchema);
module.exports = Ballot;


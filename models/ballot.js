var mongoose = require('mongoose');

var ballotSchema = new mongoose.Schema({
  createdOn: { type: Date, default: Date.now },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  score: Number,
  modelType: {type: String, default: 'Ballot'} //we do this manually because embedded docs don't seem to have modelName in their constructor
});

ballotSchema.pre('save', function(next){ //right before saving a new ballot, make a new entry in the activity collection
  // istanbul ignore else: ballot vote can't be changed
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
// virtual to convert score(1-10) to stars (1-3)
ballotSchema.virtual('toStars').get(function(){
  if (this.score <= 3){
    return 1;
  } else if (this.score > 3 && this.score <= 6){
    return 2;
  } else if (this.score > 6 && this.score <= 10){
    return 3;
  } else {
    // default case incase it doesn't fit above
    return 3;
  }
});
//Build the Ballot model
var Ballot = mongoose.model('Ballot', ballotSchema);
module.exports = Ballot;


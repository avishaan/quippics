var mongoose = require("mongoose");

var submissionSchema = new mongoose.Schema({
  createdOn: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  //these are users who are invited at the creation of the submission
  image:
  { data: Buffer, contentType: String },
  thumbnail:
  { data: Buffer, contentType: String },
  //ballots: [Ballot.schema],
  //comments: [Comment.schema],
  score: { type: Number, default: 0}, //we calculate this in the pre save
  rank: { type: Number, default: 0}, //this should be calculated before every ballot added
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge"} //we save the challenge id of each submission for easy querying
});
//Build the submission model
var Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;

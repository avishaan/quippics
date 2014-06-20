var mongoose = require('mongoose');


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
    { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  ],
  privacy: { type: String }
});

//Build the challenge model
var Challenge = mongoose.model('Challenge', challengeSchema);
//export the Challenge module
module.exports = Challenge;

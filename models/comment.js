var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  comment: {type: String},
  commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date: {type: Date, default: Date.now}
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

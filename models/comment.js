var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  comment: {type: String},
  commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date: {type: Date, default: Date.now},
  modelType: {type: String, default: 'Comment'} //we do this manually because embedded docs don't seem to have modelName in their constructor
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

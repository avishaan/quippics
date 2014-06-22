var mongoose = require("mongoose");
var fs = require('fs');

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

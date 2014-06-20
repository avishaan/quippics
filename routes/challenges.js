var Challenge = require("../models/challenge.js");
var perPage = 24; //challenges per page

//make a new challenge
exports.create = function(req, res){
  var newChallenge = new Challenge({
    title: req.body.title,
    description: req.body.description,
    tags: req.body.tags,
    owner: req.body.owner,
    invites: req.body.invites, //this is the list of friends you want to invite
    privacy: req.body.privacy,
    expiration: req.body.expiration
  });
  newChallenge.save(function(err, challenge){
    if (!err){
      res.send(200, challenge);
    } else {
      res.send(500, err);
    }
  });
};

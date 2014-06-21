var Challenge = require("../models/challenge.js");
var perPage = 24; //challenges per page

//all current challenges applicable to me
exports.myChallenges = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  Challenge
    .find({}, {participants: {$elemMatch: {user: req.params.uid}}})
    //.or([{owner: req.params.uid}, {privacy: 'public'}])
    .select('_id owner title createdOn expiration invites')
    //.slice('submissions', 1) //only get one submission for each challenge
    //.populate({
    //  path: 'submissions',
    //  select: 'thumbnail'
    //})
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    //TODO fix this date offset, this was a temp patch
    //.where('expiration').gt((new Date(Date.now())).setHours((new Date(Date.now())).getHours()-7))
    //only return participant status of user performing this query
    //.elemMatch('participants', { user: req.params.uid })
    .sort({expiration: 'ascending'})
    .lean()
    .exec(function(err, challenges){
      if (!err){
        if (challenges && challenges.length){
          //temp field for number of users invited
          challenges.forEach(function(values, index){
            challenges[index].numParticipants = challenges[index].invites.length;
          });
          res.send(200, challenges);
        } else {
          res.send(404, {clientMsg: "Couldn't find any challenges for this user"});
        }
      } else {
        res.send(500, err);
      }
    });
};
//make a new challenge
exports.create = function(req, res){
  var newChallenge = new Challenge({
    title: req.body.title,
    description: req.body.description,
    tags: req.body.tags,
    owner: req.body.owner,
    invites: req.body.invites, //this is the list of friends you want to invite
    privacy: req.body.privacy,
    expiration: req.body.expiration,
    participants: []
  });
  //add each of the invited users onto the participants list as status=invited
  if (req.body.invites.length>0){
    req.body.invites.forEach(function(value, index, array){
      newChallenge.participants.push({user: value, inviteStatus: 'invited'});
    });
  }
  newChallenge.save(function(err, challenge){
    if (!err){
      res.send(200, challenge);
    } else {
      res.send(500, err);
    }
  });
};

var Challenge = require("../models/challenge.js");
var perPage = 24; //challenges per page

//decline an invite to a challenge
exports.declineChallenge = function(req, res){
  //find the challenge
  Challenge
  //only return the user in the participants
    .findOne({_id: req.params.cid}, {participants: {$elemMatch: {user: req.body.user}}})
    //.or([{owner: req.params.uid}, {privacy: 'public'}])
    .select('_id owner title createdOn expiration participants invites')
    .exec(function(err, challenge){
      if (!err && challenge) {
        //set the inviteStatus to declined 
        //TODO need to use upsert here
        challenge.participants[0].inviteStatus = 'declined';
        challenge.save(function(err, updatedChallenge){
          if (!err && updatedChallenge){
            res.send(200);
          } else {
            res.send(500, err);
          }
        });
      } else {
        res.send(500, err);
      }
    });
};
//accept an invite to a challenge
exports.acceptChallenge = function(req, res){
  //find the challenge
  Challenge
  //only return the user in the participants
    .findOne({_id: req.params.cid}, {participants: {$elemMatch: {user: req.body.user}}})
    //.or([{owner: req.params.uid}, {privacy: 'public'}])
    .select('_id owner title createdOn expiration participants invites')
    .exec(function(err, challenge){
      if (!err && challenge) {
        //set the inviteStatus to accepted
        //TODO need to use upsert here
        challenge.participants[0].inviteStatus = 'accepted';
        challenge.save(function(err, updatedChallenge){
          if (!err && updatedChallenge){
            res.send(200);
          } else {
            res.send(500, err);
          }
        });
      } else {
        res.send(500, err);
      }
    });
};
//all archived challenges applicable to me
exports.archivedChallenges = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  Challenge
    .find({'participants.inviteStatus': {$ne: 'declined'}}, {participants: {$elemMatch: {user: req.params.uid}}})
    .or([{owner: req.params.uid}, {'participants.user': req.params.uid}, {privacy: 'public'}])
    //.where().ne({'participants.inviteStatus': 'declined'})
    .select('_id owner title createdOn expiration invites')
    //.slice('submissions', 1) //only get one submission for each challenge
    //.populate({
    //  path: 'submissions',
    //  select: 'thumbnail'
    //})
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    //TODO fix this date offset, this was a temp patch
    .where('expiration').lt((new Date(Date.now())).setHours((new Date(Date.now())).getHours()-7))
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
            //if (challenges[index].participants){
            //  challenges[index].inviteStatus = challenges[index].participants[0].inviteStatus;
            //} else {
            //  challenges[index].inviteStatus = 'owner';
            //}
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
//all current challenges applicable to me
exports.myChallenges = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  Challenge
    .find({'participants.inviteStatus': {$ne: 'declined'}}, {participants: {$elemMatch: {user: req.params.uid}}})
    .or([{owner: req.params.uid}, {'participants.user': req.params.uid}, {privacy: 'public'}])
    //.where().ne({'participants.inviteStatus': 'declined'})
    .select('_id owner title createdOn expiration invites')
    //.slice('submissions', 1) //only get one submission for each challenge
    //.populate({
    //  path: 'submissions',
    //  select: 'thumbnail'
    //})
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    //TODO fix this date offset, this was a temp patch
    .where('expiration').gt((new Date(Date.now())).setHours((new Date(Date.now())).getHours()-7))
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
            if (challenges[index].participants){
              challenges[index].inviteStatus = challenges[index].participants[0].inviteStatus;
            } else {
              challenges[index].inviteStatus = 'owner';
            }
            //TODO calculate unscored submissions
            challenges[index].unscored = 99;
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

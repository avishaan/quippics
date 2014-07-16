var Challenge = require("../models/challenge.js");
var User = require("../models/user.js");
var mongoose = require('mongoose');
var perPage = 24; //challenges per page

//read specific challenge
exports.read = function(req, res){
  Challenge.findOne({_id: req.params.cid})
  .select('title owner _id description tags createdOn expiration')
  .exec(function(err, challenge){
    if (!err) {
      if (challenge){
        res.send(200, challenge);
      } else {
        res.send(404);
      }
    } else {
      res.send(500, err);
    }
  });
};
//get/read all the users participating in a challenge
exports.readUsers = function(req, res){
  /*
  Challenge
  .findOne({_id: req.params.cid})
  .populate({
    path: 'participants.user',
    select: 'username thumbnail'
  })
  .exec(function(err, challenge){
    debugger;
  });
  */
  Challenge
  .aggregate()
  .match({ '_id': mongoose.Types.ObjectId(req.params.cid)})
  .project({
    title: 1,
    description: 1
  })
  //.aggregate(
  //  {
  //    $match: {
  //      '_id': req.params.cid
  //    }
  //  },
  //  {
  //    $unwind: '$participants'
  //  },
  //  {
  //    $project: {
  //      users: "$participants.user"
  //    }
  //  }
  //)
  .exec(function(err, users){
    req;
    mongoose;
    debugger;
  });
};
//hide a challenge from the user archive
exports.hideChallenge = function(req, res){
  Challenge
  .update(
    {
      _id: req.params.cid,
      participants: {$elemMatch: {user: req.body.user}}
    },
    {
      'participants.$.hidden': true
    },
    {
      multi: false
    },
    function(err, numAffected){
      if (!err && numAffected == 1){
        return res.send(200, {clientMsg: "Challenge Hidden"});
      } else if (!err){
        res.send(500, {clientMsg: "Multiple Challenge Hidden"});
        throw new Error('Multiple Challenge Updated as hidden');
      } else {
        res.send(500, err);
        throw new Error('Error trying to hide a challenge');
      }
  });
};
//decline an invite to a challenge
exports.declineChallenge = function(req, res){
  Challenge
  .update(
    {
      _id: req.params.cid,
      participants: {$elemMatch: {user: req.body.user}}
    },
    {
      'participants.$.inviteStatus': 'declined'
    },
    {
      multi: false
    },
    function(err, numAffected){
      if (!err && numAffected == 1){
        return res.send(200, {clientMsg: "Challenge Declined"});
      } else if (!err){
        res.send(500, {clientMsg: "Multiple Challenge Declined"});
        throw new Error('Multiple Challenge Updated as declined');
      } else {
        res.send(500, err);
        throw new Error('Error with a  declined challenge');
      }
  });
};
//accept an invite to a challenge
exports.acceptChallenge = function(req, res){
  Challenge
  .update(
    {
      _id: req.params.cid,
      participants: {$elemMatch: {user: req.body.user}}
    },
    {
      'participants.$.inviteStatus': 'accepted'
    },
    {
      multi: false
    },
    function(err, numAffected){
      if (!err && numAffected === 1){
        return res.send(200, {clientMsg: "Challenge Accepted"});
      } else if (!err){
        res.send(500, {clientMsg: "Multiple Challenge Accepted"});
        throw new Error('Multiple Challenge Updated as accepted');
      } else {
        res.send(500, err);
        throw new Error('Error with a  accepted challenge');
      }
  });
};
//all archived challenges applicable to me
exports.archivedChallenges = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  //challenges that are expired where user is 1.owner 2.participant not declined 3.participant not hidden
  Challenge
    //.find({'participants.inviteStatus': {$ne: 'declined'}}, {participants: {$elemMatch: {user: req.params.uid}}})
    //.or([{owner: req.params.uid}, {'participants.user': req.params.uid}, {privacy: 'public'}])
    //.find({'participants.user': req.params.uid}, {'participants.inviteStatus': 'invited'})
    .find({})
    .or([{participants: {$elemMatch: {
      user: req.params.uid,
      inviteStatus: {$ne: 'declined'},
      hidden: false
    }}}])//where user matches userid and they didn't decline
    .or([{owner: req.params.uid}]) //where the user is the owner
    //.or([{'participants.user': req.params.uid}])
    //.where().ne({'participants.inviteStatus': 'declined'})
    .select('_id owner title createdOn expiration invites participants')
    //.slice('submissions', 1) //only get one submission for each challenge
    //.populate({
    //  path: 'submissions',
    //  select: 'thumbnail'
    //})
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    //TODO fix this date offset, this was a temp patch
    .where('expiration').lt(Date.now())
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
    .where('expiration').gt(Date.now())
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
      //assuming a good save, add a proper activity
      require("../models/activity.js").create(challenge);
      res.send(200, challenge);
    } else {
      res.send(500, err);
    }
  });
};

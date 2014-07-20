var Challenge = require("../models/challenge.js");
var User = require("../models/user.js");
var mongoose = require('mongoose');
var async = require('async');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var perPage = 24; //challenges per page

//read specific challenge
exports.read = function(req, res){
  if (!isObjectId(req.params.cid)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge.findOne({_id: req.params.cid})
  .select('title owner _id description tags createdOn expiration')
  .exec(function(err, challenge){
    if (!err) {
      if (challenge){
        return res.send(200, challenge);
      } else {
        return res.send(200, {clientMsg: "No Challenges Found"});
      }
    } else {
      res.send(500, err);
    }
  });
};
//get/read all the users participating in a challenge
exports.readUsers = function(req, res){
  req.params.page = req.params.page || 1;
  if (!isObjectId(req.params.cid) &&
      !validatorIsNumeric(req.params.page)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
   async.waterfall([
    function(cb){
      Challenge
      .aggregate()
      .match({ '_id': mongoose.Types.ObjectId(req.params.cid)})
      .unwind('participants')
      .project({
        'user': '$participants.user',
        '_id': 0
      })
      .sort({'user': 'ascending'}) //we are actually sorting by userid since we haven't populated with the username field yet
      .skip(perPage * (req.params.page - 1))
      .limit(perPage)
      .exec(function(err, users){
        if (!err && users){
          cb(null, users);
        } else if (!err){
          cb({clientMsg: 'No Users Present'});
        } else {
          cb(err);
        }
      });
    },
    function(users, cb){
      User
      .populate(users, {
        path: 'user',
        select: 'username thumbnail'
      }, function(err, popUsers){
        if (!err && popUsers){
          cb(null, popUsers);
        } else if (!err){
          cb({clientMsg: 'No Users Present'});
        } else {
          cb(err);
        }
      });
    }
    ],
    function(err, results){
      if (!err && results){
        return res.send(200, results);
      } else {
        return res.send(500, err);
      }
  });
};
//hide a challenge from the user archive
exports.hideChallenge = function(req, res){
  //check the user sent everything first
  if (!isObjectId(req.params.cid) &&
      !isObjectId(req.body.user)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
        console.log('numAffected: ', numAffected, 'user', req.body.user);
        return res.send(500, {clientMsg: "Couldn't Hide Challenge, try later"});
      } else {
        return res.send(500, err);
      }
  });
};
//decline an invite to a challenge
exports.declineChallenge = function(req, res){
  //check the user sent everything first
  if (!isObjectId(req.params.cid) &&
      !isObjectId(req.body.user)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
        console.log('numAffected: ', numAffected, 'user', req.body.user);
        return res.send(500, {clientMsg: "Couldn't Decline Challenge, try later"});
      } else {
        return res.send(500, err);
      }
  });
};
//accept an invite to a challenge
exports.acceptChallenge = function(req, res){
  //check the user sent everything first
  if (!isObjectId(req.params.cid) &&
      !isObjectId(req.body.user)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
        console.log('numAffected: ', numAffected, 'user', req.body.user);
        return res.send(500, {clientMsg: "Couldn't Accept Challenge, try later"});
      } else {
        return res.send(500, err);
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

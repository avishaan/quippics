var Challenge = require("../models/challenge.js");
var User = require("../models/user.js");
var mongoose = require('mongoose');
var async = require('async');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var perPage = 24; //challenges per page
var logger = require('../logger/logger.js');

//read specific challenge
exports.read = function(req, res){
  // istanbul ignore if: bad requests
  if (!isObjectId(req.params.cid)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge.findOne({_id: req.params.cid})
  .select('title owner _id description tags createdOn expiration privacy persisted private')
  .exec(function(err, challenge){
    // istanbul ignore else: db error
    if (!err) {
      if (challenge){
        return res.send(200, challenge.toJSON({getters: true, virtuals: true}));
      } else {
        return res.send(404, {clientMsg: "No Challenges Found"});
      }
    } else {
      res.send(500, err);
    }
  });
};
//get/read all the users participating in a challenge
exports.readUsers = function(req, res){
  req.params.page = req.params.page || 1;
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
      !validator.isNumeric(req.params.page)){
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
        // istanbul ignore else: db error
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
        // istanbul ignore else: db error
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
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
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
      // istanbul ignore else: db error
      } else if (!err){
        logger.debug('numAffected: ', numAffected, 'user', req.body.user);
        return res.send(500, {clientMsg: "Couldn't Hide Challenge, try later"});
      } else {
        logger.error("Error! ", {err: err, stack: new Error().stack});
        return res.send(500, err);
      }
  });
};
//decline an invite to a challenge
exports.declineChallenge = function(req, res){
  //check the user sent everything first
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
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
      // istanbul ignore else: db error
      } else if (!err){
        logger.debug('numAffected: ', numAffected, 'user', req.body.user);
        return res.send(500, {clientMsg: "Couldn't Decline Challenge, try later"});
      } else {
        logger.error("Error! ", {err: err, stack: new Error().stack});
        return res.send(500, err);
      }
  });
};
//accept an invite to a challenge
exports.acceptChallenge = function(req, res){
  //check the user sent everything first
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.cid) ||
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
      // istanbul ignore else: db error
      } else if (!err){
        logger.debug('numAffected: ', numAffected, 'user', req.body.user);
        return res.send(500, {clientMsg: "Couldn't Accept Challenge, try later"});
      } else {
        logger.error("Error! ", {err: err, stack: new Error().stack});
        return res.send(500, err);
      }
  });
};
//all archived challenges applicable to me
exports.archivedChallenges = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.uid) ||
      !validator.isNumeric(req.params.page)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
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
    //.or([{owner: req.params.uid}]) //where the user is the owner
    //.or([{'participants.user': req.params.uid}])
    //.where().ne({'participants.inviteStatus': 'declined'})
    .select('_id owner title createdOn submissions expiration invites participants')
    //.slice('submissions', 1) //only get one submission for each challenge
    .populate({
      path: 'submissions',
      select: 'thumbnail score rank',
      match: {owner: req.params.uid}
    })
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    .where('expiration').lt(Date.now())
    //only return participant status of user performing this query
    //.elemMatch('participants', { user: req.params.uid })
    .sort({expiration: 'descending'})
    .lean()
    .exec(function(err, challenges){
      // istanbul ignore else: db error
      if (!err){
        if (challenges && challenges.length){
          //temp field for number of users invited
          //TODO, this can easily be calculated when a challenge is created instead
          challenges.forEach(function(challenge, index){
            challenges[index].numParticipants = challenges[index].invites.length;
            //if (challenges[index].participants){
            //  challenges[index].inviteStatus = challenges[index].participants[0].inviteStatus;
            //} else {
            //  challenges[index].inviteStatus = 'owner';
            //}

            //make sure only one submission is returned if there are multiple
            if (challenge.submissions && challenge.submissions.length && (challenge.submissions.length > 1) ){
              var submission = challenge.submissions[0];
              challenges[index].submissions = [];
              challenges[index].submissions.push(submission);
            }
          });
          return res.send(200, challenges);
        } else {
          return res.send(404, {clientMsg: "Couldn't find any challenges for this user"});
        }
      } else {
        return res.send(500, err);
      }
    });
};
//all current challenges applicable to me
exports.myChallenges = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.uid) ||
      !validator.isNumeric(req.params.page)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  Challenge
    .find({participants: {$elemMatch: {user: req.params.uid, inviteStatus: {$ne: 'declined'}}}})
    .or([{owner: req.params.uid}, {'participants.user': req.params.uid}, {privacy: 'public'}])
    //.where().ne({'participants.inviteStatus': 'declined'})
    .select('_id owner title submissions createdOn expiration invites participants')
    //.slice('submissions', 1) //only get one submission for each challenge
    .populate({
      path: 'owner',
      select: 'username'
    })
    .populate({
      path: 'submissions',
      select: 'thumbnail owner ballots'
    })
    .skip(perPage * (req.params.page - 1))
    .limit(perPage)
    .where('expiration').gt(new Date(Date.now()).setHours(new Date(Date.now()).getHours()-24))
    //only return participant status of user performing this query
    //.elemMatch('participants', { user: req.params.uid })
    .sort({expiration: 'ascending'})
    //.lean()
    .exec(function(err, challenges){
      // istanbul ignore else: db error
      if (!err){
        if (challenges && challenges.length){
          //TODO, could use aggregate framework to do some of this
          //temp field for number of users invited
          challenges.forEach(function(challenge, index){
            challenges[index].numParticipants = challenges[index].invites.length + 1;
            //go through each participant
            if (challenge.participants && challenge.participants.length){
              challenges[index].participants.forEach(function(participant, pindex){
                //if it matches the id, use that as the invite status
                if (participant.user.toString() === req.params.uid){
                  challenges[index].inviteStatus = participant.inviteStatus;
                }
              });
            }
            //calculate/set unscored submissions
            challenges[index].scored = req.params.uid;
            //remove the participants for cleanup
            //only return the first submission after our calculation so don't return a bunch of thumbnail to FE
            challenges[index].submissions = challenges[index].submissions.slice(0,1);
            //dont return the participants to the front end
            delete challenges[index]._doc.participants;
          });
          return res.send(200, challenges);
        } else {
          return res.send(404, {clientMsg: "Couldn't find any challenges for this user"});
        }
      } else {
        return res.send(500, err);
      }
    });
};
//make a new challenge V2
exports.createV2 = function(req, res){
  // istanbul ignore if: bad request
  if (!validator.isAscii(req.body.title) ||
      !isObjectId(req.body.owner)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  var newChallenge = new Challenge({
    title: req.body.title,
    tags: req.body.tags,
    owner: req.body.owner,
    invites: req.body.invites || [], //this is the list of friends you want to invite
    privacy: req.body.privacy,
    expiration: req.body.expiration,
    participants: []
  });
  //add owner to the array as accepted for simplicity sake
  newChallenge.participants.push({user: req.body.owner, inviteStatus: 'owner'});
  //add each of the invited users onto the participants list as status=invited
  if (req.body.invites && (req.body.invites.length>0)){
    req.body.invites.forEach(function(value, index, array){
      // as of gh#107 we assume the user has accepted
      newChallenge.participants.push({user: value, inviteStatus: 'accepted'});
    });
  }
  async.series([
    function(cb){
      // if the challenge privacy is public then automatically add all the followers of that user
      if (newChallenge.privacy === 'followers'){
        // find all the followers of the creator of the challenge and add them as participants
        User
        .findOne({_id: newChallenge.owner})
        .select('_id')
        .exec(function(err, user){
          if (user){
            user.getFollowers(function(err, followers){
              if (!err && followers && followers.length){
                // take each of the followers and add to participants
                followers.forEach(function(value, index, array){
                  newChallenge.participants.push({user: value._id, inviteStatus: 'accepted'});
                });
                cb(null);
              } else {
                cb(err);
              }
            });
          } else {
            cb(err);
          }
        });
      } else {
        cb(null);
      }
    },
    function(cb){
    //check if the user is the persistAdmin, in which case set the challenge type accordingly
      User.isPersistUser(req.body.owner, function(err, match){
        if (!err && match){
          // if the user that created the challenge is the persistUser
          newChallenge.persisted = true;
          // persisted challenges should add all existing users to the challenge
          User
          .find()
          .where('username').ne('admin')
          .limit(5000)
          .sort({joinDate: 'descending'})
          .select('_id')
          .lean()
          .exec(function(err, users){
            if (!err && users && users.length){
              users.forEach(function(user, index){
                //update the participants array
                newChallenge.participants.push({user: user._id, inviteStatus: 'accepted'});
                //update the invites array also
                newChallenge.invites.push(user._id);
              });
              // update the number of invites as well
            }
            cb(null);
          });
        } else {
          // just move on to the next bit of code
          cb(null);
        }
      });
    },
    function(cb){
      newChallenge.numParticipants = newChallenge.participants.length;
      cb(null);
    }
  ],
  function(err, results){
    newChallenge.save(function(err, challenge){
      // istanbul ignore else: db error
      if (!err){
        if (challenge){
          //a good save means we should add an activity 
          require("../models/activity.js").create(challenge);
          return res.send(200, challenge);
        } else {
          return res.send(500, {clientMsg: "Could not save challenge at this time"});
        }
      } else {
        return res.send(500, err);
      }
    });
  });
};
//make a new challenge
exports.create = function(req, res){
  // istanbul ignore if: bad request
  if (!validator.isAscii(req.body.title) ||
      !validator.isAscii(req.body.description) ||
      !isObjectId(req.body.owner)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  var newChallenge = new Challenge({
    title: req.body.title,
    description: req.body.description,
    tags: req.body.tags,
    owner: req.body.owner,
    invites: req.body.invites || [], //this is the list of friends you want to invite
    privacy: req.body.privacy,
    expiration: req.body.expiration,
    participants: []
  });
  //add owner to the array as accepted for simplicity sake
  newChallenge.participants.push({user: req.body.owner, inviteStatus: 'owner'});
  //add each of the invited users onto the participants list as status=invited
  if (req.body.invites && (req.body.invites.length>0)){
    req.body.invites.forEach(function(value, index, array){
      newChallenge.participants.push({user: value, inviteStatus: 'invited'});
    });
  }
  async.series([
    function(cb){
    //check if the user is the persistAdmin, in which case set the challenge type accordingly
      User.isPersistUser(req.body.owner, function(err, match){
        if (!err && match){
          // if the user that created the challenge is the persistUser
          newChallenge.persisted = true;
          // persisted challenges should add all existing users to the challenge
          User
          .find()
          .where('username').ne('admin')
          .limit(5000)
          .sort({joinDate: 'descending'})
          .select('_id')
          .lean()
          .exec(function(err, users){
            if (!err && users && users.length){
              users.forEach(function(user, index){
                //update the participants array
                newChallenge.participants.push({user: user._id, inviteStatus: 'invited'});
                //update the invites array also
                newChallenge.invites.push(user._id);
              });
              // update the number of invites as well
            }
            cb(null);
          });
        } else {
          // just move on to the next bit of code
          cb(null);
        }
      });
    },
    function(cb){
      newChallenge.numParticipants = newChallenge.invites.length;
      cb(null);
    }
  ],
  function(err, results){
    newChallenge.save(function(err, challenge){
      // istanbul ignore else: db error
      if (!err){
        if (challenge){
          //a good save means we should add an activity 
          require("../models/activity.js").create(challenge);
          return res.send(200, challenge);
        } else {
          return res.send(500, {clientMsg: "Could not save challenge at this time"});
        }
      } else {
        return res.send(500, err);
      }
    });
  });
};

/*
|-------------------------------------------------------------
| User Routes
|-------------------------------------------------------------
*/

var User = require("../models/user.js");
var Challenge = require('../models/challenge.js');
var perPage = 24;
var async = require('async');
var validator = require('validator');
var isObjectId = require('valid-objectid').isValid;
var Device = require('apnagent').Device;
var _ = require('underscore');
var logger = require('../logger/logger.js');
var mongoose = require('mongoose');

// istanbul ignore next: this function doesn't do anything
exports.list = function(req, res){
  res.send("respond with a resource");
};
//for logout, we are just removing notifications for that device
exports.logout = function(req, res){
  if (!validator.isLength(req.body.uuid, 1, 100) ||
      !isObjectId(req.body.id)) {
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  //normalize the token
  var uuid = new Device(req.body.uuid).toString();
  User.removeDevice({id: req.body.id, uuid: uuid}, function(err){
    if (!err){
      return res.send(200, {clientMsg: "Successful Logout"});
    } else {
      return res.send(500, err);
    }
  });
};
//function that handles a password reset request
exports.resetPassword = function(req, res){
  //make sure the correct data came in
  if (!validator.isEmail(req.body.email)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  //go ahead and call reset
  User.resetPassword(req.body.email, req.body.username, function(err){
    if(!err){
      return res.send(200, {clientMsg: "Password reset sent to email"});
    } else {
      return res.send(500, {clientMsg: "Couldn't send email, try again later", err:err});
    }
  });
};
exports.registerDevice = function(req, res){
  //expect a user param
  // istanbul ignore if: bad request
  if (!validator.isLength(req.body.uuid, 1, 100) ||
      !isObjectId(req.params.uid) ||
        !validator.isNumeric(req.body.tokenTimestamp)){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  //normalize token
  var token = new Device(req.body.uuid).toString();
  async.series([
  function(cb){
    //remove any existing instance of the token
    User.removeTokens({uuid: token}, function(err, numUpdate){
      //we don't care whether or not we can remove token as it may not exist yet
      if (!err){
        cb(null);
      } else {
        cb(err);
      }
    });
  },
  function(cb){
    //find user associated with the uid
    User.findOne({_id: req.params.uid})
    .select('devices')
    .exec(function(err, user){
      //TODO need to handle the errors
      //check to see if that token already exists
      if (!err && user){
        if (_.findWhere(user.devices, {uuid: token})){
          //since the token exists, go ahead find it, and update timestamp
          user.devices.forEach(function(device){
            if (device.uuid === token){
              device.timestamp = req.body.tokenTimestamp;
            }
          });
        } else {
          user.devices.push({
            uuid: token,
            timestamp: req.body.tokenTimestamp
          });
        }
        //go ahead and save the model
        user.save(function(err, user){
          if (!err && user){
            //no error
            cb(null);
          } else {
            //some sort of error
            cb({clientMsg: "Couldn't update user", err: err});
          }
        });
      } else {
        //handle me bro
        cb({clientMsg: "Couldn't register device", err: err});
      }
    });
  }
  ],function(err, results){
    if (!err){
      return res.send(200, {clientMsg: "Successfully registered device"});
    } else {
      return res.send(500, err);
    }
  });
};

//Authenticate a user in order to get the user id here
exports.authenticate = function(req, res){
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });
  user.authenticate(function(err, authUser){
    // istanbul ignore else: internal error
    if (!err){
      if (authUser){
        return res.send(200, {
          '_id': authUser._id
        });
      } else {
        return res.send(401, {
          'clientMsg': 'Wrong username or password'
        });
      }
    } else {
      return res.send(401, {
        'err': err,
        'clientMsg': 'Wrong username or password'
      });
    }
  });
};
//search for a user and return list of results
exports.search = function(req, res){
  var search = new RegExp('^([a-z0-9_\\.-]*)'+req.params.search+'([a-z0-9_\\.-]*)$', "i");
  User.find({username: search})
    .select('username thumbnail')
    .exec(function(err, users){
      // istanbul ignore else: db err
      if (!err){
        if (users){
          return res.send(users);
        } else {
          return res.send(404, {clientMsg: "No users found, try another search term"});
        }
      } else {
        return res.send(500, err);
      }
    });
};
//see all the friend Requests for a user
exports.friendRequests = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  var skip = perPage * (req.params.page - 1);
  // istanbul ignore if: bad request
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  User.findOne({_id: req.params.uid})
    .select('friendRequests')
    .populate({
      path: 'friendRequests', //connect the id in the friend array to the full user information
      select: 'username thumbnail _id lastLogin', //but only return the username from the full user information
      options: {
        limit: perPage,
        skip: skip
      }
    })
    .exec(function(err, user){
      // istanbul ignore else: db error
      if (!err){
        if (user) {
          return res.send(200, user); //return the list of friends and their usernames
        } else {
          return res.send(404, {clientMsg: "Couldn't find user"});
        }
      } else {
        return res.send(500, err);
      }
    });
};
//accept an incoming friendRequest
exports.acceptRequests = function(req, res){
  var requestorId = req.body.user;
  var acceptorId = req.params.uid;
  // istanbul ignore if: bad request
  if (!isObjectId(req.body.user) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  //TODO make this parallel, they can go at the same time
  async.series([
    function(cb){
    var acceptor = null;
    //find the user accepting the request, acceptor
    User
    .findOne({_id: acceptorId})
    .select('friendRequests friends')
    .exec(function(err, acceptor){
      //load the information from the acceptor
      // istanbul ignore else: db error
      if (!err){
        if (acceptor){
        //remove the requestor from the acceptors friendRequests array
        acceptor.friendRequests.pull(requestorId);
        //add the requestor to the friends array of the acceptor
        acceptor.friends.addToSet(requestorId);
        acceptor.save(function(err, savedAcceptor){
          if (!err && savedAcceptor){
            cb(null, savedAcceptor);
          // istanbul ignore else: db error
          } else if (!err && !savedAcceptor){
            cb({clientMsg: "Could not save updated friend in acceptor"});
          } else {
            cb(err);
          }
        });
        } else {
          cb({clientMsg: "Couldn't find user accepting the request"});
        }
      } else {
        cb(err);
      }
    });
    },
    function(cb){
      var requestor = null;
      //find the user requesting the friend ship, requestor
      User
      .findOne({_id: requestorId})
      .select('friends')
      .exec(function(err, requestor){
        //load the information from the requestor
        if(!err && requestor) {
          //add the acceptor to the friends array of the requestor
          requestor.friends.addToSet(acceptorId);
          requestor.save(function(err, savedRequestor){
            if (!err && savedRequestor){
              cb(null, savedRequestor);
              // istanbul ignore else: db error
            } else if(!err && !savedRequestor){
              cb({clientMsg: "Could not save updated friend in requestor"});
            } else {
              cb(err);
            }
          });
        // istanbul ignore else: db error
        } else if(!err && !requestor){
          cb({clientMsg: "Could not find user requesting the acceptance of the request"});
        } else {
          cb(err);
        }
      });
    }
  ],
  function(err, results){
    if(err){
      return res.send(500, err);
    } else {
      //no error, send ok status to front end
      return res.send(200, {clientMsg: "Friend request accepted"});
    }
  });
};
//decline an incoming friendRequest
exports.declinedRequests = function(req, res){
  //find the decliner of the request (resource who is doing the declining)
  //User
  //.update({_id: req.params.uid},
  //        { $pull: {friendRequests: {_id: req.body.user}}}, function(err, num, raw){
  //          res.send(200);
  //        });
  // istanbul ignore if: bad request
  if (!isObjectId(req.body.user) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  User
  .findOne({_id: req.params.uid})
  .select('_id friendRequests')
  .exec(function(err, decliner){
    if (!err && decliner){
      //remove the initiator from the friendRequests of the decliner
      decliner.friendRequests.pull(req.body.user);
      decliner.save(function(err, user){
        if (!err && user){
          return res.send(200, {clientMsg: "Friend request declined"});
        // istanbul ignore else: db error
        } else if (!err && !user){
          return res.send(500, {clientMsg: "Couldn't decline friend request, try again"});
        } else {
          return res.send(500, err);
        }
      });
    // istanbul ignore else: db error
    } else if(!err){
      return res.send(404, {clientMsg: "Couldn't find user, check user id"});
    } else {
      return res.send(500, err);
    }
  });
};
// block/stop follower
exports.blockFollower = function(req, res){
  //find the decliner of the request (resource who is doing the declining)
  //User
  //.update({_id: req.params.uid},
  //        { $pull: {friendRequests: {_id: req.body.user}}}, function(err, num, raw){
  //          res.send(200);
  //        });
  // istanbul ignore if: bad request
  if (!isObjectId(req.body.user) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  // find the list of who the user in the body follows and remove the user in the url from that list
  User
  .findOne({_id: req.body.user})
  .select('_id follows')
  .exec(function(err, user){
    if (!err && user){
      user.follows.pull(req.params.uid);
      user.save(function(err, user){
        if (!err && user){
          return res.send(200, {clientMsg: "Friend request declined"});
        // istanbul ignore else: db error
        } else if (!err && !user){
          return res.send(500, {clientMsg: "Could not stop following user"});
        } else {
          return res.send(500, err);
        }
      });
    // istanbul ignore else: db error
    } else if(!err){
      return res.send(404, {clientMsg: "Couldn't find user, check user id"});
    } else {
      return res.send(500, err);
    }
  });
};
// stop following a user
exports.stopFollow = function(req, res){
  //find the decliner of the request (resource who is doing the declining)
  //User
  //.update({_id: req.params.uid},
  //        { $pull: {friendRequests: {_id: req.body.user}}}, function(err, num, raw){
  //          res.send(200);
  //        });
  // istanbul ignore if: bad request
  if (!isObjectId(req.body.user) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  User
  .findOne({_id: req.params.uid})
  .select('_id follows')
  .exec(function(err, user){
    if (!err && user){
      //remove the initiator from the friendRequests of the decliner
      user.follows.pull(req.body.user);
      user.save(function(err, user){
        if (!err && user){
          return res.send(200, {clientMsg: "Friend request declined"});
        // istanbul ignore else: db error
        } else if (!err && !user){
          return res.send(500, {clientMsg: "Could not stop following user"});
        } else {
          return res.send(500, err);
        }
      });
    // istanbul ignore else: db error
    } else if(!err){
      return res.send(404, {clientMsg: "Couldn't find user, check user id"})
    } else {
      return res.send(500, err);
    }
  });
};
//make a friend request from user in body to user in the :uid
exports.follow = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.uid) ||
      !isObjectId(req.body.user)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  var followerId = req.params.uid; // person who wants to follow
  var leaderId = req.body.user; // the person who is being followed
  var follower; // we will store our returned model here so we can save it later
  var leader; // we will store our returned model here so we can save it later
  async.series([
    function(cb){
    // find the user who wants to follow req.body.user
      User
      .findOne({_id: followerId})
      .select('_id follows username')
      .exec(function(err, user){
        // istanbul ignore else: db error
        if (!err && user) {
          // assign returned user as the follower
          follower = user;
          // make sure we found the user who wants to follow
          // now that we have this user, go ahead and confirm that they are requesting to follow
          // a user that exists
          cb(null);
        } else {
          return cb({err: err, clientMsg: 'Could not find follower'});
        }
      });
      //if the user has made this request before, don't let him make it again, else add to the initators requestedFriends (prevent multiple requests)
    },
    function(cb){
      // find the user who is being followed, they would be the leader in this case
      User
      .findOne({ _id: leaderId })
      .select('_id username')
      .exec(function(err, user){
        if (!err && user){
          // assign returned user as leader incase we need for soemthing else
          leader = user;
          // next step
          cb(null);
        // istanbul ignore else: db error
        } else {
          return cb({ err: err, clientMsg: 'Could not find leader' });
        }
      });
    },
    function(cb){
      // go ahead and add the follower to the leader and save
      follower.follows.addToSet(leaderId);
      follower.save(function(err, user){
        if (!err && user){
          cb(null);
        } else {
          return cb({err: err, clientMsg: 'Could not follow the leader'});
        }
      });
    },
    function(cb){
      // after adding the follower, see if the leader has any public challenges, if so add the follower to the leaders public challenges
      // get all the challenges the leader is the owner of and not expired
      // we don't care if adding a participant works since it is not important to this
      // TODO, this should happen post following a user, that means to look in the follows array for a change
      cb(null);
      Challenge
      .find({ owner: leaderId })
      .where('expiration').gt(Date.now())
      .where('privacy').equals('followers')
      .select('participants')
      .exec(function(err, challenges){
        if (!err && challenges && challenges.length){
          // get each challenge and add the follower as an accepted party to the challenge
          challenges.forEach(function(challenge, index){
            // first check if followerId is already participating in the challenge
            var participating = challenge.participants.some(function(participant, index){
              return participant.user.toString() == followerId;
            });
            // var participating = _.findWhere(challenge.participants, {user: mongoose.Types.ObjectId(leaderId)});
            // if it doesn't, we add. if it does we ignore
            if (!participating){
              // add the follower to the leader's challenge, don't worry about whether it worked or not
              challenge.addParticipant({ participant: followerId, inviteStatus: 'accepted' }, function(err, num){
                // since we don't care if this happens, move on to the next step.
              });
            }
          });
        }
      });
    }
  ],
  function(err, results){
    if (err){
      return res.send(500, err);
    } else {
      //no error, send ok status to front end
      return res.send(200, {clientMsg: "Friend requested successfully"});
    }
  });
};
//make a friend request from user in body to user in the :uid
exports.requestFriend = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.uid) ||
      !isObjectId(req.body.friend)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  async.series([
    function(cb){
      //find the user initiating the request
      User
      .findOne({_id: req.body.friend})
      .select('_id requestedFriends')
      .exec(function(err, initiator){
        // istanbul ignore else: db error
        if (!err && initiator) {
          //make sure this user hasn't tried this before, if so stop him
          //TODO below is super inefficient, consider using lean query
          if (_.indexOf(_.map(initiator.requestedFriends, function(element){return element.toString();}), req.params.uid) !== -1){
            //initiator has made this request before send error
            return cb({clientMsg: "Can't make duplicate friend request"});
          } else {
            //initiator has not made this request before, go ahead and allow it
            initiator.requestedFriends.addToSet(req.params.uid);
            //save the update initator
            initiator.save(function(err, user){
              if (!err && user){
              return cb(null);//go to next step in the series 
              // istanbul ignore else: db error
              } else if (!err){
                return cb({clientMsg: "Could not save friend request, try again later"});
              } else {
                return cb(err);
              }
            });
          }
        } else {
          return cb(err);
        }
      });
      //if the user has made this request before, don't let him make it again, else add to the initators requestedFriends (prevent multiple requests)
    },
    function(cb){
      //find the user accepting the request
      User
      .findOne({_id: req.params.uid})
      .select('_id friendRequests')
      .exec(function(err, acceptor){
        if (!err && acceptor){
          //add the initiator to the acceptor's friendRequests
          acceptor.friendRequests.addToSet(req.body.friend);
          acceptor.save(function(err, user){
            if (!err && user){
              return cb(null);
            // istanbul ignore else: db error
            } else if (!err){
              return cb({clientMsg: "Could not save friend request, try again later"});
            } else {
              return cb(err);
            }
          });
        // istanbul ignore else: db error
        } else if (!err){
          return cb({clientMsg: "Could not find user, check user and try again later"});
        } else {
          return cb(err);
        }
      });
    }
  ],
  function(err, results){
    if (err){
      return res.send(500, err);
    } else {
      //no error, send ok status to front end
      return res.send(200, {clientMsg: "Friend requested successfully"});
    }
  });
};

// list any peeps (users that you follow or are followers)
exports.listPeeps = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  var skip = perPage * (req.params.page - 1);
  // want to be able to access the user obj from anywhere
  var user;
  var followers;
  var follows;
  var peeps;

  // istanbul ignore if: bad request
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  async.series([
  function(cb){
    // find the user we want to get the peeps for
    User
    .findOne({_id: req.params.uid})
    .select('_id, username')
    .exec(function(err, doc){
      user = doc;
      cb(err);
    });
  },
  function(cb){
    // find the followers
    user.getFollowers(function(err, docs){
      // make sure we get a result incase no followers or old version
      if (!err && docs && docs.length){
        followers = docs;
        // keep only the ids
        followers = followers.map(function(item){
          return item._id.toString();
        });
        cb(null);
      } else if (!err && docs){
        followers = [];
        cb(null);
      } else {
        cb({err: err, clientMsg: 'Could not find any followers'});
      }
    });
  },
  function(cb){
    // find our follows
    user.getFollows(function(err, docs){
      if (!err && docs && docs.length){
        follows = docs;
        // keep only the ids
        follows = follows.map(function(item){
          return item._id.toString();
        });
        cb(null);
      } else {
        cb({err: err, clientMsg: 'Could not find anyone following'});
      }
    });
  },
  function(cb){
    // if the array has nothing in it, do an error
    if (!follows.length && !followers.length){
      cb({clientMsg: 'No followers and following no one '});
    }
    // combine array
    peeps = follows.concat(followers);
    // remove dups
    peeps = _.uniq(peeps);
    // sort in order
    peeps.sort(function(item1, item2){
      return item1 > item2;
    });
    // skip array elements based on skip
    peeps = _.last(peeps, peeps.length - skip);
    // return the correct number from the front
    peeps = _.first(peeps, perPage);
    cb(null);
  },
  function(cb){
    // populate this list of ids
    User
    .find({_id: {$in: peeps}})
    .select('username _id thumbnail')
    .lean()
    .exec(function(err, users){
      peeps = users;
      cb(err);
    });
  },
  function(cb){
    // create the object response, either via transform or manually
    peeps = peeps.map(function(peep){
      // if the follows array contains this id, this peep follows the user
      if (_.intersection(follows, [peep._id.toString()]).length) {
        peep.isFollow = true;
      } else {
        peep.isFollow = false;
      }
      // if the followers array contains this id, this peep is a follower of the user
      if (_.intersection(followers, [peep._id.toString()]).length) {
        peep.isFollower = true;
      } else {
        peep.isFollower = false;
      }
      return peep;
    });
    cb(null);
  }
  ], function(err, results){
    if (err){
      logger.error(err);
      res.send(200, []);
    } else {
      res.send(200, peeps);
    }
  });
};
// list your followers
exports.listFollowers = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  var skip = perPage * (req.params.page - 1);
  var followers;

  // istanbul ignore if: bad request
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  var leaderID = req.params.uid;
  // get any user that is follows the user in the req paramater
  // find the user we want to get the followers for
  async.waterfall([
  function(cb){
    User
    .findOne({ _id: leaderID })
    .select('_id')
    .exec(function(err, leader){
      if (!err && leader){
        cb(null, leader);
      } else {
        cb(err);
        res.send(500, err);
      }
    });
  },
  function(leader, cb){
        leader.getFollowers(function(err, users){
          // istanbul ignore else: db error
          if (!err){
            cb(null, users);
          } else {
            cb(err);
          }
        });
  },
  function(users, cb){
    if (users && users.length){
      // get only the ids
      followers = users.map(function(user){
        return user._id;
      });
      User
      .find({ _id: { $in: followers } })
      .select('username _id thumbnail')
      .lean()
      .exec(function(err, followers){
        if (!err){
          cb(null, followers);
        } else {
          cb(err);
        }
      });
    } else {
      cb(null, []);
    }
  }
  ], function(err, followers){
    if (err){
      res.send(500, err);
    } else {
      res.send(200, followers);
    }
  });
};
// list of people the user is following
exports.listFollows = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  var skip = perPage * (req.params.page - 1);
  // list of people following to return
  var follows;

  // istanbul ignore if: bad request
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  User.findOne({_id: req.params.uid})
    .select('follows')
    .populate({
      path: 'follows', //connect the id in the follows array to the full user information
      select: 'username thumbnail _id lastLogin', //but only return the username from the full user information
      options: {
        limit: perPage,
        sort: 'username',
        skip: skip
      }
    })
    .lean()
    .exec(function(err, user){
      // istanbul ignore else: db error
      if (!err){
        if (user && user.follows) {
          follows = user.follows.map(function(user){
            return user;
          });
          return res.send(200, follows); //return the list of users you follow
        } else {
          return res.send(404, {clientMsg: "Couldn't find user"});
        }
      } else {
        return res.send(500, err);
      }
    });
};
//get list of friends of the user
exports.listFriends = function(req, res){
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  var skip = perPage * (req.params.page - 1);

  // istanbul ignore if: bad request
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  User.findOne({_id: req.params.uid})
    .select('friends')
    .populate({
      path: 'friends', //connect the id in the friend array to the full user information
      select: 'username thumbnail _id lastLogin', //but only return the username from the full user information
      options: {
        limit: perPage,
        sort: 'username',
        skip: skip
      }
    })
    .exec(function(err, user){
      // istanbul ignore else: db error
      if (!err){
        if (user) {
          return res.send(200, user); //return the list of friends and their usernames
        } else {
          return res.send(404, {clientMsg: "Couldn't find user"});
        }
      } else {
        return res.send(500, err);
      }
    });
};

//get list of users
exports.listUsers = function(req, res){
  //TODO, show users with pending friend requests
  //if the page number was not passed, go ahead and default to page one for backward compatibility
  req.params.page = req.params.page || 1;
  var friends; //keep this outside so we can access easily
  // istanbul ignore if: bad request
  if (!validator.isNumeric(req.params.page) ||
      !isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  async.series([
    function(cb){
      User.findOne({_id: req.params.uid})
      .lean()
      .select('friends')
      .exec(function(err, user){
        if (!err && user){
          //set friends for next bit
          friends = user.friends;
          cb(null, user);
        } else {
          cb(err);
        }
      });
    },
    function(cb){
      User.find({}, 'username _id thumbnail')
      .ne('_id', req.params.uid) //don't return the user who is running the query
      .skip(perPage * (req.params.page - 1))
      .limit(perPage)
      .lean()
      .exec(function(err, users){
        if(!err && users.length){
          //convert friend array to strings
          friends.forEach(function(friend, index){
            friends[index] = friend.toString();
          });
          //find out if some friends were returned
          users.forEach(function(user, index){
            if (_.contains(friends, user._id.toString())){
              users[index].friendStatus = true;
            } else {
              users[index].friendStatus = false;
            }
          });
          cb(null, users);
          // istanbul ignore else: db error
        } else if (!err){
          cb({clientMsg: "Could not find users"});
        } else {
          cb(err);
        }
      });
    }
  ], function(err, results){
    if (err){
      return res.send(500, err);
    } else {
      return res.send(200, results[1]);
    }
  });
};
//get profile of a user
exports.profile = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  User.findOne({_id: req.params.uid})
    .select('username email thumbnail rank')
    .exec(function(err, user){
      // istanbul ignore else: db error
      if (!err){ //no error
        if (user){
          return res.send(200, user);
        } else { //we didn't find a user but no error
          return res.send(404, {clientMsg: "Could not find user"});
        }
      } else { //error occured
        return res.send(500, err);
      }
    });
};
//Update a user here
exports.update = function(req, res){
  // istanbul ignore if: bad request
  if (!isObjectId(req.params.uid)
     ){
    return res.send(400, {clientMsg: "Malformed Request"});
  }
  User.findOne({_id: req.params.uid}, function(err, user){
    // istanbul ignore else: db error
    if (!err){
      if (user){
        //get the information passed in from the body and set it to the properties of the model
        user.username  = req.body.newUsername ? req.body.newUsername : user.username;
        user.email = req.body.email ? req.body.email : user.email;
        user.password = req.body.newPassword ? req.body.newPassword : user.password;
        user.addImage(req, function(){
          //save the user the user to the database.
          user.save(function(err, updatedUser){
            // istanbul ignore else: db error
            if (!err){
              return res.send(200, {
                username: updatedUser.username,
                _id : updatedUser._id
              });
            } else { //there was some sort of db error saving
              return res.send(500, err);
            }
          });
        });
      } else { //no user found, no error
        return res.send(404);
      }
    } else { //some sort of error, let the client know
      logger.error("Error! ", {err: err, stack: new Error().stack});
      return res.send(500, err);
    }

  });

};

//Register a new user here
exports.register = function(req, res){
  //TODO add validation to the incoming body
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });
  user.addImage(req, function(err){
    // istanbul ignore else: db error
    if (!err){
      user.save(function(err, newUser){
        if (!err){
          //add user to any persisted challenge
          //find any challenge of type persist that is not expired
          Challenge
          .find({persisted: true})
          .where('expiration').gt(Date.now())
          .select('expiration numParticipants invites participants')
          .exec(function(err, challenges){
            //add this user as invited to all of those challenges and update accordingly
            challenges.forEach(function(value, index){
              //for each challenge, add the user as invited
              challenges[index].participants.push({user: newUser.id, inviteStatus: 'invited'});
              challenges[index].invites.push(newUser.id);
              challenges[index].numParticipants++;
              challenges[index].save(function(err){
                if (err){
                  logger.error({err:err});
                }
              });
            });
          });
          //send  back to the user
          return res.send(200, {
            'username': newUser.username,
            '_id': newUser._id
          });
        } else {
          return res.send(500, {
            'err': err,
            'clientMsg': 'Could not register user'
          });
        }
      });
    } else {
      return res.send(500, err);
    }
  });
};

var mongoose = require('mongoose');
var async = require('async');

/*
|-------------------------------------------------------------
| User Schema
|-------------------------------------------------------------
*/

var userSchema = new mongoose.Schema({
  facebook: {type: String}, //facebook userid here
  twitter: {type: String},  //twitter userid here

  supporters: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }]
});

/**
 * Add a DewDrop supporter to a user. Keep in mind often times you will support a user that doesn't
 * exist yet in which case you will need to create him right then
 * @param {object} users The user details for receiver and supporter
 * @config {object} supporter The details of the supporter
 * @config {object} receiver The details of the person receiving the support
 * @param {function} cb
 * @config {object} err Passed Error
 * @config {object} user returned mongoose user object
 */
userSchema.statics.supportUser = function(users, cb){

  async.series([
    function(cb){
      //TODO, make sure we check the properties also
      if (users.supporter && users.receiver){ //everything needed was passed in
        return cb(null);
      } else {
        return cb({"clientMsg": "You didn't pass me the information for the users!"})
      }
    },
    function(cb){
      //does the supporter exist in the database?
      User.findUser(users.supporter, function(err, supporter){
        if (!err){
          if (supporter){
            users.supporter = supporter;
            return cb(null);
          } else {
            //if not, go ahead and create the supporter
            return User.createUser(users.supporter, function(err, supporter){
              if (!err){
                if (supporter){
                  //assign our user.supporter as the passed back supporter for ease of use
                  users.supporter = supporter;
                  return cb(null);
                } else {
                  return cb({"clientMsg": "Supporter creation came back blank for some reason"});
                }
              } else {
                return cb(err);
              }
            });
          }
        } else {
          return cb(err);
        }
      });

    },
    function(cb){
      //does the receiver exist in the database?
      User.findUser(users.receiver, function(err, receiver){
        if (!err){
          if (receiver){
            users.receiver = receiver;
            return cb(null);
          } else {
            //if not, go ahead and create the receiver
            return User.createUser(users.receiver, function(err, receiver){
              if (!err){
                if (receiver){
                  //assign our user.receiver as the passed back receiver for ease of use
                  users.receiver = receiver;
                  return cb(null);
                } else {
                  return cb({"clientMsg": "receiver creation came back blank for some reason"});
                }
              } else {
                return cb(err);
              }
            });
          }
        } else {
          return cb(err);
        }
      });

    }
  ], function(err){
    if (err){
      cb(err, null);
    }
    //now that both exist, go ahead and add the supporter to the supporter array of the receiver doc
    users.receiver.supporters.push(users.supporter.id);
    users.receiver.save(function(err, receiver){//save that change
      cb(null, receiver);
      //return appropriate information
    });

  });

};

userSchema.statics.createUser = function(user, cb){
  var newUser = {};
  newUser[user.network] = user.id; //follow format of {"facebook": 2};
  User.create(newUser, function(err, user){
    if (!err){
      if (user){
        return cb(null, user);
      } else {
        return cb({"clientMsg": "Could not save"}, null);
      }
    } else {
      return cb(err, null);
    }
  })
};

/**
 * Find a DewDrop user by passing in their social network id and social network type
 * @param {object} user The user details
   * @config {string} network The network type
   * @config {string} userid The user's network specific id
 * @param {function} cb
   * @config {string} err Passed Error
   * @config {object} user returned mongoose user object
 */
userSchema.statics.findUser = function(user, cb){

  //make sure everything we need to find a user is passed in.
  if (!user.id && !user.network){
    return cb({"clientMsg": "You left either the id or network type blank. Please update and try again"})
  }
  //lower case network type for consistency
  user.network = user.network.toLowerCase();

  //make sure the network type is one of the following
  if (user.network !== ("facebook" || "twitter")){
    return cb({"clientMsg": "You did not pass in a valid network type (facebook/twitter)"});
  }
  //find our user based on their social network type and social network id
  return User.findOne({})
    .or([{'facebook':user.id},{'twitter':user.id}]) //the userid should make a match with either facebook or twitter
    .exec(function(err, user){
      if (!err) {
        if (user){
          cb (null, user);
        } else {
          return cb(null, null);
        }
      } else {
        return cb(err, null);
      }

    });
};

var User = mongoose.model('User', userSchema);

module.exports = User;
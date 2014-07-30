var mongoose = require('mongoose');
var async = require('async');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 6;
var fs = require('fs');
var gm = require('gm');
var im = gm.subClass({ imageMagick: true});
var agent = require('../apn/apn.js');
/*
|-------------------------------------------------------------
| User Schema
|-------------------------------------------------------------
*/

var userSchema = new mongoose.Schema({
  password: {type: String},
  username: {type: String, unique: true},
  firstName: {type: String},
  lastName: {type: String},
  deviceToken: {type: String}, //unique token set with each login
  allowNotifications: {type: Boolean, default: true}, //whether or not to send the user notifications
  tokenTimestamp: {type: Date}, //date of last registration
  email: {type: String},
  friends: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  ],
  requestedFriends: [ //every single friend request user has made, we want to keep track of duplicate requests
    {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  ],
  friendRequests: [ //all users want to request the friendship of this user (fb style)
    {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  ],
  image: {data: Buffer, contentType: String},
  thumbnail: {data: Buffer, contentType: String},
  joinDate: {type: Date, default: Date.now},
  rank: {type: String, default: 'Newbie'},
  activities: [ //activities for the user are kept here making it easier to get my activities
    { type: mongoose.Schema.Types.ObjectId, ref: 'Activity'}
  ]
});

//validation
userSchema.path('username').validate(function(value, done){
  //if we find a user with that username already exists (case insentitive) then error
  var userInQuestion = this;
  User.findOne({username: new RegExp('^'+value+'$', "i")})
    .exec(function(err, user){
      // istanbul ignore else: db query error
      if (!err){
        if (user){
          //if there is a user, then it should fail validation only if it is not the same as the user in question
          if (user.id === userInQuestion.id){
            return done(true);
          } else {
            return done(false);
          }
        } else {
          //no user means this username is available
          return done(true);
        }
      } else {
        //there was a db query error, throw an error
        console.log("Error: ", err, new Error().stack);
        return done(true);
      }
    });
}, 'Username already exists');

userSchema.pre('save', function(next){
  var user = this;
  //before saving a user
  //encrypt the password if it has been change
  if (user.isModified('password')){
    user.hashPassword(function(err, user){
      if (!err){
        return next();
      } else {
        return next(err);
      }
    });
  } else {
    return next();
  }
  //generate a new thumbnail if the image has been changed
});
//add Image to the user model
userSchema.methods.addImage = function(req, next){
  //TODO this needs to pass back errors to the next callback so we know if it's success or not
  if (typeof req.files != 'undefined'){ //see if there are files first
  //if (req.files[Object.keys(req.files)[0]]){
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
        // istanbul ignore else: happens with file read error
        if (!err){
          next(null);
        } else {
          next(err);
        }
      });

  } else {
    next(null);
  }
};
//handle user authentication and password checking
userSchema.methods.authenticate = function(cb){
  var authUser = this;
  //first find the user
  User.findOne({username: new RegExp('^'+authUser.username+'$', "i")}) //use regex for case insensitive
    .exec(function(err, user){
      // istanbul ignore else: db error
      if(!err){
        if (user){
         // //since we found a user, let's go ahead and check their password
         user.checkPassword(authUser.password, function(err, user){
           // istanbul ignore else: db error
           if(!err){
             if(user){
               return cb(null, user);
             } else {
               return cb(null, null);
             }
           } else {
             return cb(err, null);
           }
         });
         // if (authUser.password === user.password){
         //   return cb(null, user);
         // } else {
         //   return cb(null, null);
         // }
        } else {
          return cb(null, null);
        }
      } else {
        return cb(err, null);
      }
    });
};

//password hashing, bcrypt node generates it's own salt and attaches it to the hash so no need to create yourslef 
userSchema.methods.hashPassword = function(cb){
  var user = this;
  return bcrypt.hash(user.password, SALT_WORK_FACTOR, function(err, hash){
    // istanbul ignore else: bcrypt error
    if(!err){
      //salt is always included in the hash and so doesn't need to be stored
      user.password = hash;
      return cb(null, user);
    } else {
      return cb(err, null);
    }
  });
};
//check user password
userSchema.methods.checkPassword = function(testPassword, cb){
  var user = this;
  return bcrypt.compare(testPassword, user.password, function(err, isMatch){
    // istanbul ignore else: bcrypt error
    if (!err){
      if (isMatch){
        return cb(null, user);
      } else {
        return cb(null, null);
      }
    } else {
      return cb(err, null);
    }
  });
};

/**
 * Send user(s) notifications about an event
 * @param {object} options The options for the notifications
 * @config {array} array of userid(s) Array of string userids
 * @config {object} payload of message, passed directly to agent
 * @param {function} cb
 * @config {object} err Passed Error
 */
userSchema.statics.sendNotifications = function(options, cb){
  if (!options.users || !options.payload){
    return cb({
      clientMsg: "Malformed request",
    });
  }
  var alert = options.payload.alert;
  var body = options.payload.body;

  User.find({_id: {$in: options.users}})
  .select('allowNotifications deviceToken')
  .lean()
  .exec(function(err, users){
    // istanbul ignore else: db error
    if (!err && users.length){
      users.forEach(function(user, index){
        if (user.allowNotifications && user.deviceToken){
          //if the user wants notifications and has deviceToken
          agent.createMessage()
          .device(user.deviceToken)
          .alert(alert)
          .set(body)
          .send(function(err){
          });
          //we don't care about the '.send' callback as we listen for errors on agent
          return cb(null);
        }
      });
    } else if (!err){
      return cb(null);
    } else {
      return cb(err);
    }
  });
};
//find user by token and unsubscribe
userSchema.statics.stopNotifications = function(options, cb){
  if (!options.device || !options.timestamp){
    return cb({
      clientMsg: "Malformed request",
    });
  }
  User
  .findOne({deviceToken: options.device.toString()})
  .select('allowNotifications tokenTimestamp')
  .exec(function(err, user){
    // istanbul ignore else: query error
    if (!err && user){
      //compare the timestamps
      if (user.tokenTimestamp < options.timestamp ){
        //user registered and THEN an unsub came in, stop notifications
        user.allowNotifications = false;
        user.save(); //it's not important, assume a save
        return cb();
      }
    } else if (!err && !user){
      //found no user, ignore. maybe the user was deleted
      return cb();
    } else {
      return cb({
        clientMsg: "Couldn't find user",
        err: err
      });
    }
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;

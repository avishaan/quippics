var mongoose = require('mongoose');
var async = require('async');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 6;
var fs = require('fs');
var gm = require('gm');
var im = gm.subClass({ imageMagick: true});
var agent = require('../apn/apn.js');
var transporter = require('../mail/transporter.js');
var logger = require('../logger/logger.js');
var config = require('../conf/config.js');
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
  devices: [{
    uuid: String,
    timestamp: Date
  }],
  allowNotifications: {type: Boolean, default: true}, //whether or not to send the user notifications
  email: {type: String, unique: true},
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
  badSubmissions: {type: Number, default: 0},
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
        logger.error("Error! ", {err: err, stack: new Error().stack});
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
//ban the user
userSchema.methods.ban = function(cb){
  //email the user letting them know they have been banned, do this first when we still have an email
  mailers.mailBannedUser({
    email: this.email
  });
  //use findByIdAndUpdate to bypass email middleware
  //change the password, remove the devices, remove the email address
  User
  .findByIdAndUpdate(this.id, {password: 'banned', email: 'banned@quipics.com', devices:[]})
  .exec(function(err, user){
    if (err){
      logger.error('Couldnt ban user');
    }
  });
};
//increment the number of badSubmissions the user has
userSchema.methods.incrementBadSubmissions = function(cb){
  //increment the number of bad submissions the user has
  this.badSubmissions = this.badSubmissions + 1;
  //too many badSubmissions and we need to ban the user from the system
  if (this.badSubmissions >= config.banThreshold){
    //ban the user, then save
    logger.info('User is banned');
    cb(null);
  } else {
    this.save(function(err){
      if (!err){
        cb(null);
      } else {
        cb(err);
      }
    });
  }

};
//assign tmp password and email
userSchema.statics.resetPassword = function(email, username, cb){
  //find the user by id
  User.findOne({username: username,email: email})
  .select('password email')
  .exec(function(err, user){
    //make sure username matches that of email account
    if (!err && user){
      //generate a new random password
      user.password = require('password')(2);
      //the generator uses spaces, remove them
      user.password = user.password.replace(/ /g, '');
      //set the email text
      var text = "Your password has been reset to: " + user.password + "\nPlease change your password upon login";
      //save the new password by saving the model
      user.save(function(err, user){
        if (!err && user){
          //send out an email
          transporter.sendMail({
            from: 'test@quipics.com',
            to: user.email,
            subject: 'Quipics Password Reset Email',
            text: text
          }, function(err){
            if (!err){
              return cb(null);
            } else {
              return cb({clientMsg: "Could not reset password"});
            }
          });
        } else {
          return cb({clientMsg: "Could not reset password"});
        }
      });
    } else {
      return cb({clientMsg: "Could not find user with that email"});
    }
  });
};
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
  //TODO, why the hell do we need this when it is present above, I added this during testing and without this some testing fails
  var agent = require('../apn/apn.js');
  if (!options.users || !options.payload){
    return cb({
      clientMsg: "Malformed request",
    });
  }
  var alert = options.payload.alert;
  var body = options.payload.body;
  User.aggregate([
    {$match: {_id: {$in: options.users}}},
    {$unwind: "$devices"},
    {$project: {
      uuid: '$devices.uuid',
      timestamp: '$devices.timestamp',
      _id: 0
    }}
  ], function(err, devices){
    if (!err && devices.length){
      devices.forEach(function(device, index){
        agent.createMessage()
        .device(device.uuid)
        .alert(alert)
        .set(body)
        .send(function(err){
        });
        //we don't care about the '.send' callback as we listen for errors on agent
        return cb(null);
      });
    } else if (!err){
      return cb(null);
    } else {
      return cb(err);
    }
  });
};
//remove duplicate tokens from other users, remove this token from all other users
userSchema.statics.removeTokens = function(options, cb){
  if (!options.uuid){
    return cb({clientMsg: "Malformed request"});
  }
  //find any users that already have this token
  User.update({
    'devices.uuid': options.uuid
  }, {
    $pull: {devices: {uuid: options.uuid}}
  },{
    multi: true
  },function(err, numUpdate){
    if (!err){
      return cb(null, numUpdate);
    } else {
      return cb(err);
    }
  });
};

//Remove uuid due to gateway error
userSchema.statics.gatewayRemoveDevice = function(options, cb){
  if (!options.uuid){
    return cb({
      clientMsg: "Malformed request",
    });
  }
  //find user attempting the logout
  User
  .findOne({
    'devices.uuid': options.uuid
  })
  .select('devices')
  .exec(function(err, user){
    if (!err && user && user.devices.length){
      //go through the list of user devices and find matching device
      user.devices.forEach(function(device, index){
        //check device matching
        if (options.uuid === device.uuid){
          //remove from user devices list
          user.devices.splice(index, 1);
          user.save(function(err, user){
            if (!err && user){
              return cb();
            } else {
              return cb({clientMsg: "Couldn't remove device"});
            }
          });
        }
      });
    } else {
      //couldn't find the user for whatever reason
      return cb({
        clientMsg: "Couldn't find user associated with uuid"
      });
    }
  });
  //go through the list of devices for that user
  //when you find the matching device, go ahead and remove that device
};
//Remove device from user
userSchema.statics.removeDevice = function(options, cb){
  if (!options.id|| !options.uuid){
    return cb({
      clientMsg: "Malformed request",
    });
  }
  //find user attempting the logout
  User
  .findOne({
    _id: options.id,
    'devices.uuid': options.uuid
  })
  .select('devices')
  .exec(function(err, user){
    if (!err && user && user.devices.length){
      //go through the list of user devices and find matching device
      user.devices.forEach(function(device, index){
        //check device matching
        if (options.uuid === device.uuid){
          //remove from user devices list
          user.devices.splice(index, 1);
          user.save(function(err, user){
            if (!err && user){
              return cb();
            } else {
              return cb({clientMsg: "Couldn't remove device from user"});
            }
          });
        }
      });
    } else {
      //couldn't find the user for whatever reason
      return cb({
        clientMsg: "Couldn't Find User to Logout"
      });
    }
  });
  //go through the list of devices for that user
  //when you find the matching device, go ahead and remove that device
};
//find user that has the device token and remove the device
userSchema.statics.unsubDevice = function(options, cb){
  if (!options.device || !options.timestamp){
    return cb({
      clientMsg: "Malformed request",
    });
  }
  //find the user associated with the uuid
  User
  .findOne({'devices.uuid': options.device.toString()})
  .select('devices')
  .exec(function(err, user){
    if (!err && user && user.devices.length){
      user.devices.forEach(function(device, index){
        //find location of matching uuid
        if (device.uuid === options.device.toString()){
          //once you find the user, check the unsub timestamp
           if (device.timestamp < options.timestamp){
             //if the time of the unsub is greater than in devices, unsub
             user.devices.splice(index, 1);
           }
        }
      });
      //go ahead and save
      user.save(function(err, user){
        if (!err){
          return cb();
        } else {
          return cb({
            clientMsg: "couldn't perform save",
            err: err
          });
        }
      });
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

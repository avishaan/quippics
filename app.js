
/**
 * Module dependencies.
 */

var express = require('express');
var logentries = require('node-logentries');
var routes = require('./routes');
var users = require('./routes/users');
var challenges = require('./routes/challenges');
var submissions = require('./routes/submissions');
var ballots = require('./routes/ballots');
var comments = require('./routes/comments');
var activities = require('./routes/activities');
var apns = require('./routes/apns');
var http = require('http');
var path = require('path');
var config = require('./conf/config.js');
var db = require('./dbs/db');
var util = require('./routes/util');
var server = require('./routes/server');
var User = require('./models/user.js');
var passport = require('passport'),
  BasicStrategy = require('passport-http').BasicStrategy;

//setup logentries
var log = logentries.logger({
  token: config.logentriesToken,
});
var app = express();

// local environment
if (config.env === 'local'){

}
// dev/local environments
if (config.env === 'dev' ||
    config.env === 'local'){
  app.use(express.logger('dev'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(function(req, res, next){
    log.debug();
    next();
  });
}
// all environments
app.set('port', config.expressPort);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//I am a terrible person for what I am about to do, but I need a quickfix
//TODO, TODO TODO!!!!j fix this thing immediately before the universe explodes
Buffer.prototype.toJSON = function(){ return this.toString("base64");};

//authentication strategy
passport.use(new BasicStrategy(function(username, password, done){
  //our authenticate method is for an instance, let's reuse our model authenticate here 
  //create a user instance
  var user = new User({
    username: username,
    password: password
  });
  //run it's authenticate method and check the response
  user.authenticate(function(err, user){
    if (!err && user){
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));
//auth middleware function
function apiAuth(){
  return passport.authenticate('basic', {session: false});
};

// development only
//console.log(config.env);
//if (config.env !== 'prod') {
//  app.use(express.errorHandler());
//}
//
app.get('/', routes.index);
app.post('/api/v1/mirror', util.mirror); //route will mirror back to you whatever it sees, useful for debugging
app.get('/users', users.list);
app.get('/api/v1/server', function(req, res){
  res.send(200, {clientMsg: "We are up and running"});
});
app.post('/api/v1/apns/debug', apns.debugPush); //debug push notifcations
app.post('/api/v1/apns/challenges/debug', apns.debugChallenge); //debug push notifcations for challenges
app.post('/api/v1/apns/submissions/debug', apns.debugSubmission); //debug push notifcations for submissions

//friends routes
app.post('/api/v1/users/:uid/declinedRequests', apiAuth(), users.declinedRequests);
app.get('/api/v1/users/:uid/friendRequests/page/:page', apiAuth(), users.friendRequests);
app.post('/api/v1/users/:uid/friendRequests', apiAuth(), users.requestFriend); //make a friend request from :uid to user in body
app.post('/api/v1/users/:uid/friends', apiAuth(), users.acceptRequests); //add a friend
app.get('/api/v1/users/:uid/friends/page/:page', apiAuth(), users.listFriends); //get list of all friends
//user routes
app.get('/api/v1/users/:uid/users/page/:page', apiAuth(), users.listUsers); //get list of all users
app.get('/api/v1/users/:uid', apiAuth(), users.profile); //profile of specific user
app.get('/api/v1/users/search/:search', apiAuth(), users.search); //search for a specific user
app.post('/api/v1/register', users.register); //register new user
app.post('/api/v1/users', apiAuth(), users.authenticate); //check password of user and return id
app.put('/api/v1/users/:uid', apiAuth(), users.update); //update an existing user
//comment routes
app.post('/api/v1/challenges/:cid/submissions/:sid/comments', apiAuth(), comments.create); //post a comment to a submission
app.get('/api/v1/challenges/:cid/submissions/:sid/comments/page/:page', apiAuth(), comments.readAll); //get all of the comments
//challenges routes
app.get('/api/v1/challenges/:cid/users/page/:page', apiAuth(), challenges.readUsers); //read all the users in a specific challenge
app.get('/api/v1/challenges/:cid', apiAuth(), challenges.read); //get/read a specific challenge
app.post('/api/v1/challenges', apiAuth(), challenges.create); //create a new challenge
app.get('/api/v1/users/:uid/challenges/archive/page/:page', apiAuth(), challenges.archivedChallenges); //retrieve all challenges that are archived (typically just expired)
app.get('/api/v1/users/:uid/challenges/page/:page', apiAuth(), challenges.myChallenges); //retrieve all current challenges applicable to me
app.post('/api/v1/challenges/:cid/accepts', apiAuth(), challenges.acceptChallenge); //accept a challenge
app.post('/api/v1/challenges/:cid/declines', apiAuth(), challenges.declineChallenge); //decline a challenge
app.post('/api/v1/challenges/:cid/hidden', apiAuth(), challenges.hideChallenge); //hide a challenge
//submission routes
app.post('/api/v1/challenges/:cid/submissions', apiAuth(), submissions.create); //create a new submission
app.get('/api/v1/challenges/:cid/submissions/page/:page', apiAuth(), submissions.readAll); //read all the submissions in a specific challenge
app.get('/api/v1/challenges/:cid/submissions/users/:uid', apiAuth(), submissions.userSubmission); //read the submission for a specific user
app.get('/api/v1/challenges/:cid/submissions/top', apiAuth(), submissions.readTop); //read the top submission in the challenge
app.get('/api/v1/challenges/:cid/submissions/:sid', apiAuth(), submissions.readOne); //read the submission specified
//ballot routes
app.post('/api/v1/challenges/:cid/submissions/:sid/ballots', apiAuth(), ballots.create); //submit a ballot effectively casting your vote on a submission
app.get('/api/v1/challenges/:cid/submissions/users/:uid/voted', apiAuth(), ballots.userVoted); //list of submissions the user has already voted on
//activity routes
app.get('/api/v1/activities/users/:uid/page/:page', apiAuth(), activities.myActivities); //read all the activities of the user
app.get('/api/v1/users/:uid/activities/page/:page', apiAuth(), activities.myActivities); //read all the activities of the user
app.get('/api/v1/activities/users/:uid/friends/page/:page', apiAuth(), activities.friendActivities); //read all the activities of the friends of the user
app.get('/api/v1/users/:uid/friends/activities/page/:page', apiAuth(), activities.friendActivities); //read all the activities of the friends of the user
//misc routes
app.delete('/api/v1/server', server.delete);

app.use(function(req, res){
  console.log("MISROUTE");
  res.send(404);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

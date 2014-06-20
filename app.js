
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var users = require('./routes/users');
var http = require('http');
var path = require('path');
var config = require('./conf/config.js');
var db = require('./dbs/db');
var util = require('./routes/util');
var server = require('./routes/server');

var app = express();

// all environments
if (config.env === 'dev'){
  app.use(express.logger('dev'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}
app.set('port', config.expressPort);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// development only
//console.log(config.env);
//if (config.env !== 'prod') {
//  app.use(express.errorHandler());
//}
//
app.get('/', routes.index);
app.post('/api/v1/mirror', util.mirror); //route will mirror back to you whatever it sees, useful for debugging
app.get('/users', users.list);

//user routes
app.get('/api/v1/users/:uid/friendRequests/page/:page', users.friendRequests);
app.post('/api/v1/users/:uid/friendRequests', users.requestFriend); //make a friend request from :uid to user in body
app.get('/api/v1/users/:uid/friends/page/:page', users.listFriends); //get list of all friends
app.get('/api/v1/users/:uid/users/page/:page', users.listUsers); //get list of all users
app.get('/api/v1/users/:uid', users.profile); //profile of specific user
app.get('/api/v1/users/search/:search', users.search); //search for a specific user
app.post('/api/v1/register', users.register); //register new user
app.post('/api/v1/users', users.authenticate); //check password of user and return id
app.put('/api/v1/users/:uid', users.update); //update an existing user
//misc routes
app.delete('/api/v1/server', server.delete);

app.use(function(req, res){
  console.log("MISROUTE");
  res.send(404);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var config = require('./conf/config.js');
var db = require('./dbs/db');
var util = require('./routes/util');
var server = require('./routes/server');

var app = express();

// all environments
app.set('port', config.expressPort);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger(config.env));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if (config.env === 'dev') {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/api/v1/mirror', util.mirror); //route will mirror back to you whatever it sees, useful for debugging
app.get('/users', user.list);

//misc routes
app.delete('/api/v1/server', server.delete);

app.post('/api/v1/users/:network/:uid/supporters', user.addSupporters); //add someone that this user trusts
app.get('/api/v1/users/:network/:uid/supporters', user.checkSupporters); //see list of who a user trusts
app.use(function(req, res){
  console.log("MISROUTE");
  res.send(404);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

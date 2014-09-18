var frisby = require('frisby');
var async = require('async');
var _ = require('underscore');
var superagent = require('superagent');
var db = require('../../dbs/db.js');
var agent = require('../../apn/apn.js');
var User = require('../../models/user.js');
var Challenge = require('../../models/challenge.js');
var Submission = require('../../models/submission.js');
var Device = require('apnagent').Device;
var feedback = require('../../apn/feedback.js');


var user1 = {
  username: 'popular123',
  password: '123',
  email: 'popular123@gmail.com',
  uuid: '1a91bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95',
  uuid2: '1b91bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95',
  tokenTimestamp: (Date.now()-10000) //without 10, test may fail during unsub running too quickly
};

var user2 = {
  username: 'nerd314',
  password: '314',
  email: 'nerd314@gmail.com',
  uuid: '2a91bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be76',
  tokenTimestamp: (Date.now()-10000) //without 10, test may fail during unsub running too quickly
};
var user3 = {
  username: 'user3',
  password: 'password',
  email: 'user3@gmail.com',
  uuid: '3a91bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be77',
  tokenTimestamp: (Date.now()-10000) //without 10, test may fail during unsub running too quickly
};
var challenge1 = {};
var challenge2 = {};
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission

agent.on('mock:message', function(raw){
  //console.log(raw);
});
agent.on('queue:drain', function(raw){
  //console.log(raw);
});

exports.spec = function(domain, callback){

  jasmine.getEnv().defaultTimeoutInterval = 2000;
  async.series([
    function(cb){
      console.log("Starting the notification tests");
      cb(null);
    },
    function(cb){
      frisby
      .create("Delete the database")
      .delete(domain + "/server")
      .expectStatus(200)
      .afterJSON(function(){
        console.log("Done deleting db");
        cb(null);
      })
      .toss();
    },
    function(cb){
      describe('create users', function(){
        it('user1', function(done){
          User.create({
            username: user1.username,
            password: user1.password,
            email: user1.email
          }, function(err, user){
            user1._id = user.id;
            done();
          });
        });
        it('user2', function(done){
          User.create({
            username: user2.username,
            password: user2.password,
            email: user2.email
          }, function(err, user){
            user2._id = user.id;
            done();
          });
        });
        it('user3', function(done){
          User.create({
            username: user3.username,
            password: user3.password,
            email: user3.email
          }, function(err, user){
            user3._id = user.id;
            done();
            cb(null);
          });
        });
      });
    },
  ],
  function(err, results){
    callback(null);
  });
};

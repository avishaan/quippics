var frisby = require('frisby');
var async = require('async');
var _ = require('underscore');
var superagent = require('superagent');
var db = require('../../dbs/db.js');
var User = require('../../models/user.js');
var Challenge = require('../../models/challenge.js');
var Submission = require('../../models/submission.js');


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

exports.spec = function(domain, callback){

  jasmine.getEnv().defaultTimeoutInterval = 2000;
  console.log('Running Submission Flag Tests');
  describe('The test setup', function(){
    it('should be able to delete the database', function(done){
      superagent
      .del(domain + "/server")
      .end(function(res){
        expect(res.status).toEqual(200);
        console.log("Done deleting db");
        done();
      });
    });
    it('should create a user', function(done){
      console.log('after delete');
      User.create({
        username: user1.username,
        password: user1.password,
        email: user1.email
      }, function(err, user){
        user1.id = user.id;
        done();
      });
    });
    it('should create another user', function(done){
      User.create({
        username: user2.username,
        password: user2.password,
        email: user2.email
      }, function(err, user){
        user2.id = user.id;
        done();
      });
    });
    it('should create another user', function(done){
      User.create({
        username: user3.username,
        password: user3.password,
        email: user3.email
      }, function(err, user){
        user3.id = user.id;
        done();
      });
    });
    it('should invite all the users into a challenge', function(done){
      Challenge.create({
        title: 'Challenge Title',
        description: 'Challenge Description',
        owner: user3.id,
        invites: [user1.id, user2.id, user3.id],
        privacy: 'public',
        expiration: new Date(2015, 3, 14),
        participants: [{
          user: user1.id,
          inviteStatus: 'accepted'
        },{
          user: user2.id,
          inviteStatus: 'accepted'
        },{
          user: user3.id,
          inviteStatus: 'owner'
        }]
      }, function(err, challenge){
        challenge1.id = challenge.id;
        console.log(challenge);
        done();
      })
    })
  });
};

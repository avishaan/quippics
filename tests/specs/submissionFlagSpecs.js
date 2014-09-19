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
};

var user2 = {
  username: 'nerd314',
  password: '314',
  email: 'nerd314@gmail.com',
};
var user3 = {
  username: 'user3',
  password: 'password',
  email: 'user3@gmail.com',
};
var user4 = {
  username: 'douche',
  password: 'password',
  email: 'sleepyfloydshaan@gmail.com',
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
    it('should create another user', function(done){
      User.create({
        username: user4.username,
        password: user4.password,
        email: user4.email
      }, function(err, user){
        user4.id = user.id;
        done();
      });
    });
    it('should invite all the users into a challenge and have them accept', function(done){
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
        expect(challenge.id).toBeDefined();
        expect(err).toEqual(null);
        done();
      });
    });
    it('should have user1 enter a submission', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/onepixel.png")
      .field("owner", user1.id)
      .end(function(err, res){
        var submission = res.body;
        //make sure something was returned in the response body
        expect(submission).toBeDefined();
        //make sure the id in the response body was returned
        expect(submission._id).toBeDefined();
        //expect 200 response
        expect(res.status).toEqual(200);
        submission1.id = submission._id;
        //console.log("here is the returned superagent submission");
        //console.log(submission);
        done();
      });
    });
    it('should have user4 (douche) comment on submission 1', function(done){
      superagent
      .post(domain + "/challenges/" +challenge1.id + "/submissions/" + submission1.id + '/comments')
      .send({
        commenter: user4.id,
        comment: 'My potentially offensive comment'
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should have user4 (douche) enter an inappropriate submission', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/onepixel.png")
      .field("owner", user4.id)
      .end(function(err, res){
        var submission = res.body;
        //make sure something was returned in the response body
        expect(submission).toBeDefined();
        //make sure the id in the response body was returned
        expect(submission._id).toBeDefined();
        //expect 200 response
        expect(res.status).toEqual(200);
        submission2.id = submission._id;
        //console.log("here is the returned superagent submission");
        //console.log(submission);
        done();
      });
    });
  });
  describe('Flagging of a submission', function(){
    it('should be allowed by a user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions' + submission2.id + 'flags')
      .send({
        flagger: user1.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should be allowed by a second user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions' + submission2.id + 'flags')
      .send({
        flagger: user2.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('shouldnt be impacted by a user flagging for a second time' , function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions' + submission2.id + 'flags')
      .send({
        flagger: user2.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        expect(false).toEqual(true);
        done();
      });
    });
    it('should be allowed by a third user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions' + submission2.id + 'flags')
      .send({
        flagger: user3.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
  });
};

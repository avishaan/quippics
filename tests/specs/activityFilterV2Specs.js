var frisby = require('frisby');
var async = require('async');
var superagent = require('superagent');
var agent = require('superagent');
var domainV2 = 'http://admin:admin@localhost:8081/api/v2';
var Challenge = require('../../models/challenge.js');

var user1 = {
  username: 'popular123',
  password: '123',
  email: 'popular123@gmail.com'
};

var user2 = {
  username: 'nerd314',
  password: '314',
  email: 'nerd314@gmail.com'
};
var user3 = {
  username: 'user3',
  password: 'password',
  email: 'user3@gmail.com'
};
var user4 = {
  username: 'friendly',
  password: 'password',
  email: 'friendly@gmail.com'
};
var challenge1 = {};
var challenge2 = {};
var challenge3 = {};
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission
exports.spec = function(domain, callback){
  jasmine.getEnv().defaultTimeoutInterval = 1000;
  describe("The test environment", function() {
    it("should delete everything in the database", function(done) {
      agent
      .del(domain + "/server")
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it("should create a user who is very popular", function(done) {
      agent
      .post(domain + '/register')
      .type('form')
      .attach('image', './tests/specs/images/defaultProfile.png')
      .field('username', user1.username)
      .field('password', user1.password)
      .field('email', user1.email)
      .end(function(err, res){
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined();
        user1._id = res.body._id;
        done();
      });
    });
    it("should register nerdy", function(done){
      agent
      .post(domain + '/register')
      .type('form')
      .attach('image', './tests/specs/images/defaultProfile.png')
      .field('username', user2.username)
      .field('password', user2.password)
      .field('email', user2.email)
      .end(function(err, res){
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined();
        user2._id = res.body._id;
        done();
      });
    });
    it("should register generic", function(done){
      agent
      .post(domain + '/register')
      .type('form')
      .attach('image', './tests/specs/images/defaultProfile.png')
      .field('username', user3.username)
      .field('password', user3.password)
      .field('email', user3.email)
      .end(function(err, res){
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined();
        user3._id = res.body._id;
        done();
      });
    });
    it("should register friendly", function(done){
      agent
      .post(domain + '/register')
      .type('form')
      .attach('image', './tests/specs/images/defaultProfile.png')
      .field('username', user4.username)
      .field('password', user4.password)
      .field('email', user4.email)
      .end(function(err, res){
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined();
        user4._id = res.body._id;
        done();
      });
    });
    it('should prepare a challenge', function(done){
      // setup challenge
      challenge1 = {
        title: 'Challenge1 Title',
        description: 'Challenge1 Description',
        tags: ['tag1', 'tag2', 'tag3'],
        owner: user1._id,
        privacy: 'private',
        expiration: new Date(2015, 3, 14),
        invites: [user2._id]
      };
      agent
      .post(domainV2 + "/challenges")
      .send(challenge1)
      .end(function(res){
        expect(res.status).toEqual(200);
        // save the challenge id for future use
        challenge1._id = res.body._id;
        done();
      });
    });
    //have popular submit into a challenge
    //popular should see this in activity
    it('Can be submitted by user1 (popular) into challenge 1', function(done){
      agent
      .post(domain + "/challenges/" + challenge1._id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/onepixel.png")
      .field("owner", user1._id)
      .end(function(err, res){
        var submission = res.body;
        expect(submission).toBeDefined();
        expect(submission._id).toBeDefined();
        expect(res.status).toEqual(200);
        submission1._id = submission._id;
        done();
      });
    });
  });
  describe('Followers Activities', function(){
    it('Friendly user4 should not see activity of non-friend users when he is not in their challenge and not following anyone', function(done){
      agent
      .get(domainV2 + '/users/' + user4._id + '/friends/activities/page/1')
      .end(function(err, res){
        var submission = res.body;
        expect(res.status).toEqual(500);
        done();
      });
    });
    xit("can be submitted by a User (Popular) into challenge 1", function(done){
      agent
      .post(domain + "/challenges/" + challenge1._id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/onepixel.png")
      .field("owner", user1._id)
      .end(function(err, res){
        var submission = res.body;
        //make sure something was returned in the response body
        expect(submission).toBeDefined();
        //make sure the id in the response body was returned
        expect(submission._id).toBeDefined();
        //expect 200 response
        expect(res.status).toEqual(200);
        submission2._id = submission._id;
        //console.log("here is the returned superagent submission");
        //console.log(submission);
        done();
      });
    });
    xit("can be submitted again by a User (Nerdy) into challenge 1", function(done){
      // this will make sure that a user can submit multiple submissions gh#104
      agent
      .post(domainV2 + "/challenges/" + challenge1._id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/onepixel.png")
      .field("owner", user2._id)
      .end(function(err, res){
        var submission = res.body;
        //make sure something was returned in the response body
        expect(submission).toBeDefined();
        //make sure the id in the response body was returned
        expect(submission._id).toBeDefined();
        //expect 200 response
        expect(res.status).toEqual(200);
        submission1._id = submission._id;
        //console.log("here is the returned superagent submission");
        //console.log(submission);
        done();
      });
    });
    xit("can allow you to get only one of Nerdy (user2) submission", function(done){
      // this will make sure that a user can submit multiple submissions gh#104
      agent
      .get(domainV2 + '/challenges/' + challenge1._id + '/submissions/users/' + user2._id)
      .end(function(err, res){
        var submission = res.body;
        //expect 200 response
        expect(res.status).toEqual(200);
        expect(submission).toBeDefined();
        expect(submission._id).toBeDefined();
        expect(submission.thumbnail).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.rank).toBeDefined();
        expect(submission.image).toBeDefined();
        expect(submission.commentCount).toBeDefined();
        expect(submission.commentCount).toEqual(0);
        done();
      });
    });
    xit("can get a list of submissions in a challenge which the user has submitted", function(done){
      // make sure all the users submissions for a challenge can be returned gh #120
      agent
      .get(domainV2 + '/challenges/' + challenge1._id + '/users/' + user2._id + '/submissions')
      .end(function(err, res){
        var challenge = res.body;
        var submissions = challenge.submissions;
        //expect 200 response
        expect(res.status).toEqual(200);
        expect(submissions.length).toEqual(2);
        expect(submissions[0].thumbnail).toBeDefined();
        expect(submissions[0]._id).toBeDefined();
        submissions.forEach(function(submission){
          expect(submission.thumbnail).toBeDefined();
          expect(submission.image).toBeDefined();
          expect(submission.owner.username).toBeDefined();
          expect(submission.owner._id).toBeDefined();
          expect(submission.owner._id).toEqual(user2._id);
        });
        done();
      });
    });
  });
  describe('it can move to the next test', function(){
    // we need this here so that it moves to the next test in the specRunner since
    // every test invoked requires a callback
    callback(null);
  });
};

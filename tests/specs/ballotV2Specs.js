var frisby = require('frisby');
var async = require('async');
var agent = require('superagent');
var _ = require('underscore');
var Challenge = require('../../models/challenge.js');
var Submission = require('../../models/submission.js');
var domainV2 = 'http://admin:admin@localhost:8081/api/v2';

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
var challenge1 = {};
var challenge2 = {};
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission
exports.spec = function(domain, callback){
  jasmine.getEnv().defaultTimeoutInterval = 1000;
  describe("The test environment", function() {
    it("should start the submission tests", function(done) {
      console.log("Starting the submission tests");
      done();
    });
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
    it('should prepare a challenge', function(done){
      // setup challenge
      challenge1 = {
        title: 'Challenge1 Title',
        description: 'Challenge1 Description',
        tags: ['tag1', 'tag2', 'tag3'],
        owner: user1._id,
        privacy: 'private',
        expiration: new Date(2015, 3, 14),
        invites: [user2._id, user3._id]
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
    it("can be submitted by a User (Nerdy) into challenge 1", function(done){
      agent
      .post(domain + "/challenges/" + challenge1._id + "/submissions")
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
    it("can be submitted by a User (Popular) into challenge 1", function(done){
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
  });
  describe('Voting', function(){
    it('can allow nerdy to vote on popular submission', function(done){
      agent
      .post(domainV2 + '/challenges/' + challenge1._id + '/submissions/' + submission2._id + '/ballots/')
      .send({
        score: 1,
        voter: user2._id
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        expect(res.body.score).toEqual(1);
        expect(res.body.voter).toEqual(user2._id);
        done();
      });
    });
    it('can allow nerdy to vote again and replace his previous vote', function(done){
      agent
      .post(domainV2 + '/challenges/' + challenge1._id + '/submissions/' + submission2._id + '/ballots/')
      .send({
        score: 10,
        voter: user2._id
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        // get the ballot directly from the datbase and make sure the value is 10
        Submission
        .findOne({ _id: submission2._id })
        .select('ballots')
        .exec(function(err, submission){
          expect(submission.ballots.length).toEqual(1);
          expect(submission.ballots[0].score).toEqual(10);
          expect(res).toBeDefined();
          done();
        });
      });
    });
    it('can allow nerdy to get a list of challenges to check for unscored submission', function(done){
      agent
      .get(domain + '/users/' + user2._id + '/challenges/page/1')
      .end(function(res){
        var challenges = res.body;
        expect(res.status).toEqual(200);
        expect(challenges).toBeDefined();
        //challenge1 has two submissions one is user2's own and one is user1's. He just voted above so he must have 0 unscored
        expect(challenges[0].unscored).toEqual(0);
        //even though the challenge has two submissions at this time, only one should actually be returned to FE
        expect(challenges[0].submissions.length).toEqual(1);
        done();
      });
    });
    it('can get a list of submission nerdy has voted on', function(done){
      agent
      .get(domain + '/challenges/' + challenge1._id + '/submissions/users/' + user2._id + '/voted')
      .end(function(res){
        var array = res.body;
        expect(res.status).toEqual(200);
        expect(array.length).toEqual(2);
        //also, since he can't vote on himself and we use this array to control that,
        //make sure his submissionid is there
        expect(_.intersection(array, [submission2._id, submission1._id]).length).toEqual(2);
        done();
      });
    });
    it('can make sure populars submission has the correct score', function(done){
      agent
      .get(domain + '/challenges/' + challenge1._id + '/submissions/users/' + user1._id)
      .end(function(res){
        var submission = res.body;
        expect(res.status).toEqual(200);
        expect(submission.thumbnail).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.rank).toBeDefined();
        //we expect to be in first since nerdy is the only vote and he voted us a 10
        expect(submission.rank).toEqual(1);
        expect(submission.score).toEqual(10);
        expect(submission.sum).toEqual(3);
        done();
      });
    });
    // TODO do not allow self vote
    it('can allow nerdy to vote on nerdy submission', function(done){
      agent
      .post(domainV2 + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/ballots/')
      .send({
        score: 9,
        voter: user2._id
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        // get the ballot directly from the datbase and make sure the value is 10
        Submission
        .findOne({ _id: submission1._id })
        .select('ballots')
        .exec(function(err, submission){
          expect(submission.ballots.length).toEqual(1);
          expect(submission.ballots[0].score).toEqual(9);
          expect(res).toBeDefined();
          done();
        });
      });
    });
    it('can allow popular to vote on nerdy submission', function(done){
      agent
      .post(domainV2 + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/ballots/')
      .send({
        score: 9,
        voter: user1._id
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        // get the ballot directly from the datbase and make sure the value is 10
        Submission
        .findOne({ _id: submission1._id })
        .select('ballots sum score')
        .exec(function(err, submission){
          expect(submission.ballots.length).toEqual(2);
          expect(submission.ballots[0].score).toEqual(9);
          expect(submission.sum).toEqual(6);
          expect(submission.score).toEqual(9);
          expect(res).toBeDefined();
          done();
        });
      });
    });
  });
  describe('it can move to the next test', function(){
    // we need this here so that it moves to the next test in the specRunner since
    // every test invoked requires a callback
    callback(null);
  });
};

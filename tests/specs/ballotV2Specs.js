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
        expect(submission.sum).toEqual(10);
        done();
      });
    });
  });
  async.series([
    function(cb){
      console.log("Starting the submission tests");
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
      //create a test user
      frisby
      .create("Create A user who is very generic")
      .post(domain + '/register', {
        username: user3.username,
        password: user3.password,
        email: user3.email
      })
      .expectStatus(200)
      .afterJSON(function(user){
        user3._id = user._id;
        cb(null);
      })
      .toss();
    },
    function(cb){
      //create a test user
      frisby
      .create("Create A user who is very popular")
      .post(domain + '/register', {
        username: user1.username,
        password: user1.password,
        email: user1.email
      })
      .expectStatus(200)
      .afterJSON(function(user){
        user1._id = user._id;
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Create A user who is very nerdy")
      .post(domain + '/register', {
        username: user2.username,
        password: user2.password,
        email: user2.email
      })
      .expectStatus(200)
      .afterJSON(function(user){
        user2._id = user._id;
        cb(null);
      })
      .toss();
    },
    function(cb){
      //setup our challenge
      challenge1 = {
        title: 'Challenge1 Title',
        description: 'Challenge1 Description',
        tags: ['tag1', 'tag2', 'tag3'],
        owner: user1._id,
        privacy: 'private',
        expiration: new Date(2015, 3, 14),
        invites: [user2._id, user3._id]
      };
      frisby
      .create("Have that user create a challenge")
      .post(domain + '/challenges', challenge1)
      .expectStatus(200)
      .afterJSON(function(challenge){
        expect(challenge._id).toBeDefined();
        challenge1._id = challenge._id;
        cb(null);
      })
      .toss();
    },
    function(cb){
      //have nerdy submit into the challenge
      describe("A Submission", function(){
        it("can be submitted by a User (Nerdy) into challenge 1", function(done){
          superagent
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
            cb(null);
            done();
          });
        });
      });
    },
    function(cb){
      //have popular submit into a challenge
      describe("A Submission", function(){
        it("can be submitted by a User (Popular) into challenge 1", function(done){
          superagent
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
            cb(null);
            done();
          });
        });
      });
    },
    //DO VOTING HERE
    function(cb){
      //vote on popular submission in the challenge
      frisby
      .create("Have nerdy vote on popular submission")
      .post(domainV2 + '/challenges/' + challenge1._id + '/submissions/' + submission2._id + '/ballots/', {
        score: 1,
        voter: user2._id
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //vote on popular submission in the challenge, expect override
      frisby
      .create("Have nerdy vote again on popular submission")
      .post(domainV2 + '/challenges/' + challenge1._id + '/submissions/' + submission2._id + '/ballots/', {
        score: 10,
        voter: user2._id
      })
      .expectStatus(200)
      .afterJSON(function(res){
        // get the ballot directly from the datbase and make sure the value is 10
        Submission
        .findOne({ _id: submission2._id })
        .select('ballots')
        .exec(function(err, submission){
          expect(submission.ballots.length).toEqual(1);
          expect(submission.ballots[0].score).not.toEqual(10);
          expect(res).toBeDefined();
          cb(null);
        });
      })
      .toss();
    },
    function(cb){
      //check how many unscored submissions are left *hint: he just voted on popular's submission
      frisby
      .create("Have nerdy get list of challenges checking for unscored submissions")
      .get(domain + '/users/' + user2._id + '/challenges/page/1')
      .expectStatus(200)
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        //challenge1 has two submissions one is user2's own and one is user1's. He just voted above so he must have 0 unscored
        expect(challenges[0].unscored).toEqual(0);
        //even though the challenge has two submissions at this time, only one should actually be returned to FE
        expect(challenges[0].submissions.length).toEqual(1);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get list of submissions nerdy has voted on
      frisby
      .create("Get list of submissions nerdy user has voted on")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/users/' + user2._id + '/voted')
      .expectStatus(200)
      .afterJSON(function(array){
        //all tests here
        expect(array.length).toEqual(2);
        //also, since he can't vote on himself and we use this array to control that,
        //make sure his submissionid is there
        expect(_.intersection(array, [submission2._id, submission1._id]).length).toEqual(2);
        cb(null);
      })
      .toss()
    },
    function(cb){
      //get my submission in the challenge, aka popular's submission
      frisby
      .create("Get mine aka popular's submission in a challenge")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/users/' + user1._id)
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(submission){
        expect(submission.thumbnail).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.rank).toBeDefined();
        //we expect to be in first since nerdy is the only vote and he voted us a 10
        expect(submission.rank).toEqual(1);
        expect(submission.score).toEqual(10);
        expect(submission.sum).toEqual(10);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get the top submission from a challenge
      frisby
      .create("Get a top submission from a set of challenges")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/top')
      .expectStatus(200)
      .afterJSON(function(submission){
        expect(submission.image).toBeDefined();
        expect(submission.owner).toBeDefined();
        //we know that popular user is in first so we expect his to be returned
        expect(submission.owner).toEqual(user1.username);
        expect(submission.score).toBeDefined();
        expect(submission.score).toEqual(10);
        expect(submission.rank).toBeDefined();
        expect(submission.rank).toEqual(1);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //read an existing submission
      frisby
      .create("Get an existing submission, let's get Nerdy's submission")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id)
      .expectStatus(200)
      .afterJSON(function(submission){
        expect(submission).toBeDefined();
        expect(submission.challenge).toBeDefined();
        expect(submission.rank).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.image).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get all of the submissions a specific user has voted on 
      frisby
      .create("Get all the submission a user has voted on")
      .get(domain + '/users/' + user2._id + '/submissions/voted')
      .expectStatus(200)
      .afterJSON(function(submissions){
        expect(submissions.length).toBeDefined();
        expect(submissions.length).toEqual(1);
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Have nerdy vote on nerdy submission")
      .post(domainV2 + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/ballots/', {
        score: 9,
        voter: user2._id
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res).toBeDefined();
        // get the ballot directly from the datbase and make sure the value is 10
        Submission
        .findOne({ _id: submission1._id })
        .select('ballots')
        .exec(function(err, submission){
          expect(submission.ballots.length).toEqual(1);
          expect(submission.ballots[0].score).not.toEqual(9);
          expect(res).toBeDefined();
          cb(null);
        });
      })
      .toss();
    },
    function(cb){
      //make sure the list of submissions work across challenges
      frisby
      .create("Again, Get all the submission a user has voted on")
      .get(domain + '/users/' + user2._id + '/submissions/voted')
      .expectStatus(200)
      .afterJSON(function(submissions){
        expect(submissions.length).toEqual(2);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get the challenge from the database and make it expired
      describe('The Date', function(){
        it('Will be made in the past so we can test in archive', function(done){
          Challenge
          .findOne({_id: challenge1._id })
          .exec(function(err, challenge){
            challenge.expiration = new Date(2013, 10, 15);
            challenge.save(function(err, saved){
              done();
              cb(err);
            });
          });
        });
      });
    },
    function(cb){
      // now find all the archived submissions for a user and make sure the rank for it is correct
      frisby
      .create("Get mine aka popular's archived challenges")
      .get(domain + '/users/' + user1._id + '/challenges/archive/page/1')
      .expectStatus(200)
      .inspectJSON()
      .afterJSON(function(challenges){
        console.log('enter');
        expect(challenges[0].submissions[0].rank).toEqual(1);
        // make sure the id we are checking the rank for matches pop user's id
        expect(challenges[0].submissions[0]._id).toEqual(submission2._id);
        console.log(submission2._id);
        cb(null);
      })
      .toss();
    }
  ],
  function(err, results){
    callback(null);
  });
};

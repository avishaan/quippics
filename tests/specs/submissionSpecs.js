var frisby = require('frisby');
var async = require('async');
var superagent = require('superagent');

var user1 = {
  username: 'popular123',
  password: '123',
  email: 'popular123@gmail.com',
  uuid: 'a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95',
  tokenTimestamp: Date.now()
};

var user2 = {
  username: 'nerd314',
  password: '314',
  email: 'nerd314@gmail.com',
  uuid: 'a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be76',
  tokenTimestamp: Date.now()
};
var user3 = {
  username: 'user3',
  password: 'password',
  email: 'user3@gmail.com',
  uuid: 'a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be77',
  tokenTimestamp: Date.now()
};
var challenge1 = {};
var challenge2 = {};
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission
var submission3 = {}; // submission added to test next/prev submission for #85
exports.spec = function(domain, callback){
  jasmine.getEnv().defaultTimeoutInterval = 1000;
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
      frisby
      .create("Register user1 device")
      .post(domain + '/users/' + user1._id + '/device', {
        uuid: user1.uuid,
        tokenTimestamp: user1.tokenTimestamp
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res.clientMsg).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Register user2 device")
      .post(domain + '/users/' + user2._id + '/device', {
        uuid: user2.uuid,
        tokenTimestamp: user2.tokenTimestamp
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res.clientMsg).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Register user3 device")
      .post(domain + '/users/' + user3._id + '/device', {
        uuid: user3.uuid,
        tokenTimestamp: user3.tokenTimestamp
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res.clientMsg).toBeDefined();
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
    function(cb){
      //get list of the submissions for a challenge
      frisby
      .create("Get list of submissions for a challenge")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/page/1')
      .expectStatus(200)
      .afterJSON(function(submissions){
        expect(submissions.length).toEqual(2);
        expect(submissions[0].thumbnail).toBeDefined();
        expect(submissions[0]._id).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get my submission in the challenge, aka nerdy's submission
      frisby
      .create("Get mine aka nerdy's submission in a challenge")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/users/' + user2._id)
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(submission){
        expect(submission.thumbnail).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.rank).toBeDefined();
        expect(submission.image).toBeDefined();
        expect(submission.commentCount).toBeDefined();
        expect(submission.commentCount).toEqual(0);
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
        expect(submission.owner).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.rank).toBeDefined();
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
      //.inspectJSON()
      .afterJSON(function(submission){
        //full tests here
        expect(submission).toBeDefined();
        expect(submission.challenge).toBeDefined();
        expect(submission.challenge.title).toBeDefined();
        expect(submission.challenge.description).toBeDefined();
        expect(submission.challenge.tags).toBeDefined();
        expect(submission.rank).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.image).toBeDefined();
        expect(submission.owner.username).toBeDefined();
        expect(submission.owner._id).toBeDefined();
        expect(submission.comments).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      // make sure we can get the submission after when looking at the first submission
      frisby
      .create("Look at the first submission made")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id)
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(submission){
        //full tests here
        expect(submission).toBeDefined();
        expect(submission.challenge).toBeDefined();
        expect(submission.challenge.title).toBeDefined();
        expect(submission.challenge.description).toBeDefined();
        expect(submission.challenge.tags).toBeDefined();
        expect(submission.rank).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.image).toBeDefined();
        expect(submission.owner.username).toBeDefined();
        expect(submission.owner._id).toBeDefined();
        expect(submission.comments).toBeDefined();
        expect(submission.nextSubmission).toEqual(submission2._id);
        expect(submission.prevSubmission).toEqual(null);
        cb(null);
      })
      .toss();
    },
    function(cb){
      // have user3 submit so we can have three submissions to test all cases for #85
      describe("A Submission", function(){
        it("can be submitted by user 3", function(done){
          superagent
          .post(domain + "/challenges/" + challenge1._id + "/submissions")
          .type('form')
          .attach("image", "./tests/specs/images/onepixel.png")
          .field("owner", user3._id)
          .end(function(err, res){
            var submission = res.body;
            //make sure something was returned in the response body
            expect(submission).toBeDefined();
            //make sure the id in the response body was returned
            expect(submission._id).toBeDefined();
            //expect 200 response
            expect(res.status).toEqual(200);
            submission3._id = submission._id;
            //console.log("here is the returned superagent submission");
            //console.log(submission);
            cb(null);
            done();
          });
        });
      });
    },
    function(cb){
      // there should be a submission before and after the second submission
      frisby
      .create("Look at the second submission made")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission2._id)
      .expectStatus(200)
      .afterJSON(function(submission){
        //full tests here
        expect(submission).toBeDefined();
        expect(submission.challenge).toBeDefined();
        expect(submission.challenge.title).toBeDefined();
        expect(submission.challenge.description).toBeDefined();
        expect(submission.challenge.tags).toBeDefined();
        expect(submission.rank).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.image).toBeDefined();
        expect(submission.owner.username).toBeDefined();
        expect(submission.owner._id).toBeDefined();
        expect(submission.comments).toBeDefined();
        expect(submission.nextSubmission).toEqual(submission3._id);
        expect(submission.prevSubmission).toEqual(submission1._id);
        cb(null);
      })
      .toss();
    },
    function(cb){
      // there should only be a submission before the last submission
      frisby
      .create("Look at the third submission made")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission3._id)
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(submission){
        //full tests here
        expect(submission).toBeDefined();
        expect(submission.challenge).toBeDefined();
        expect(submission.challenge.title).toBeDefined();
        expect(submission.challenge.description).toBeDefined();
        expect(submission.challenge.tags).toBeDefined();
        expect(submission.rank).toBeDefined();
        expect(submission.score).toBeDefined();
        expect(submission.owner).toBeDefined();
        expect(submission.image).toBeDefined();
        expect(submission.owner.username).toBeDefined();
        expect(submission.owner._id).toBeDefined();
        expect(submission.comments).toBeDefined();
        expect(submission.nextSubmission).toEqual(null);
        expect(submission.prevSubmission).toEqual(submission2._id);
        cb(null);
      })
      .toss();
    },
  ],
  function(err, results){
    callback(null);
  });
};

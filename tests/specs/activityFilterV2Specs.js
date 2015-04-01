var frisby = require('frisby');
var async = require('async');
var superagent = require('superagent');
var agent = require('superagent');
var domainV2 = 'http://admin:admin@localhost:8081/api/v2';
var Challenge = require('../../models/challenge.js');

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
  username: 'friendly',
  password: 'password',
  email: 'friendly@gmail.com',
};

var challenge1 = {};
var challenge2 = {};
var challenge3 = {};
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission
// summary of what is going on so I can keep this straight
// popular creates a challenge1
// popular submits to challenge1 (nerdy2 invite)
// popular checks own activity, sees stuff 
// friendly checks activity, sees nothing
// nerdy checks activity, sees nothing
// Popular follows nerdy
// Nerdy should not see any activity when popular is following nerdy
// Nerdy follows popular
// Nerdy checks activity, see's populars activities
// Friendly creates challenge2 (only popular invited)
// popular submits to challenge2
// Nerdy checks activity, should not see anything regarding challenge2 since Nerdy not invited
// Nerdy votes on popular submission in challenge1
// Popular checks follows activities, should only see Nerdy vote
// Nerdy declines challenge1
// Nerdy checks activity, should see no activity since was only in challenge1
// Nerdy blocks Popular
// Popular checks activity, now since he is not following there will be no activities
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
        user1.id = res.body._id;
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
        user2.id = res.body._id;
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
        user3.id = res.body._id;
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
        user4.id = res.body._id;
        done();
      });
    });
    it('Popular should prepare a challenge', function(done){
      // setup challenge
      challenge1 = {
        title: 'Challenge1 Title',
        description: 'Challenge1 Description',
        tags: ['tag1', 'tag2', 'tag3'],
        owner: user1.id,
        privacy: 'private',
        expiration: new Date(2015, 3, 14),
        invites: [user2.id]
      };
      agent
      .post(domainV2 + "/challenges")
      .send(challenge1)
      .end(function(res){
        expect(res.status).toEqual(200);
        // save the challenge id for future use
        challenge1.id = res.body._id;
        done();
      });
    });
    //have popular submit into a challenge
    //popular should see this in activity
    it('Can be submitted by user1 (popular) into challenge 1', function(done){
      agent
      .post(domain + "/challenges/" + challenge1.id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/onepixel.png")
      .field("owner", user1.id)
      .end(function(err, res){
        var submission = res.body;
        expect(submission).toBeDefined();
        expect(submission._id).toBeDefined();
        expect(res.status).toEqual(200);
        submission1.id = submission._id;
        done();
      });
    });
  });
  describe('Activities', function(){
    it('Allow popular to check own activities', function(done){
      agent
      .get(domain + '/users/' + user1.id + '/activities/page/1')
      .end(function(err, res){
        var activities = res.body;
        expect(activities.length).toEqual(2);
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('Friendly user4 should not see activity of non-follows users when he is not in their challenge and not following anyone', function(done){
      agent
      .get(domainV2 + '/users/' + user4.id + '/follows/activities/page/1')
      .end(function(err, res){
        expect(res.status).toEqual(500);
        done();
      });
    });
    it('Nerdy user2 should not see activity of non-follows users who are in his challenges', function(done){
      agent
      .get(domainV2 + '/users/' + user2.id + '/follows/activities/page/1')
      .end(function(err, res){
        expect(res.status).toEqual(500);
        done();
      });
    });
    it('Popular can follow nerdy', function(done){
      superagent
      .post(domain + "/users/" + user1.id + '/follows')
      .send({
        user: user2.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('Nerdy (user2) should not see the activity of popular (users1) when Popular is following Nerdy', function(done){
      agent
      .get(domainV2 + '/users/' + user2.id + '/follows/activities/page/1')
      .end(function(err, res){
        expect(res.status).toEqual(500);
        done();
      });
    });
    it('Nerdy will follow popular, thereby being interested in his activity', function(done){
      superagent
      .post(domain + "/users/" + user2.id + '/follows')
      .send({
        user: user1.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('Nerdy should see activity of popular now that he is following him', function(done){
      agent
      .get(domainV2 + '/users/' + user2.id + '/follows/activities/page/1')
      .end(function(err, res){
        var activities = res.body;
        expect(res.status).toEqual(200);
        expect(activities.length).toEqual(2);
        done();
      });
    });
    it('Should allow friendly to create a challenge inviting Popular', function(done){
      challenge2 = {
        title: 'Challenge2 Title',
        description: 'Challenge2 Description',
        tags: ['tag1', 'tag2', 'tag3'],
        owner: user4.id,
        privacy: 'private',
        expiration: new Date(2015, 3, 14),
        invites: [user1.id]
      };
      agent
      .post(domainV2 + "/challenges")
      .send(challenge2)
      .end(function(res){
        expect(res.status).toEqual(200);
        // save the challenge id for future use
        challenge2.id = res.body._id;
        done();
      });
    });
    it('It can be submitted by a user (Popular) into challenge 2 where Nerdy isnt invited', function(done){
      agent
      .post(domain + "/challenges/" + challenge2.id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/onepixel.png")
      .field("owner", user1.id)
      .end(function(err, res){
        var submission = res.body;
        expect(submission).toBeDefined();
        expect(submission._id).toBeDefined();
        expect(res.status).toEqual(200);
        submission2.id = submission._id;
        done();
      });
    });
    it('Nerdy should not see activities of Popular other challenges even though Nerdy follows Popular', function(done){
      //share a friendship, not a challenge
      agent
      .get(domainV2 + '/users/' + user2.id + '/follows/activities/page/1')
      .end(function(err, res){
        var activities = res.body;
        expect(res.status).toEqual(200);
        // still should only see 2 activities
        expect(activities.length).toEqual(2);
        // we should only see challenge1 and submission1 since nerdy is only invited to challenge1 and friends with popular
        activities.forEach(function(activity){
          //console.log(activity);
          if (activity.modelType === 'Submission'){
            expect(activity.subject._id).toEqual(user1.id);
            expect(activity.references.submission._id).toEqual(submission1.id);
          } else if (activity.modelType === 'Challenge'){
            expect(activity.subject._id).toEqual(user1.id);
            expect(activity.references.challenge._id).toEqual(challenge1.id);
          } else {
            // only activitites are challenge or submission
            expect(false).toEqual(true);
          }
        });
        done();
      });
    });
    it('can allow nerdy to vote on popular submission', function(done){
      //nerdy vote on popular submission in the challenge
      //popular and nerdy should see this in activity
      agent
      .post(domainV2 + '/challenges/' + challenge1.id + '/submissions/' + submission2.id + '/ballots/')
      .send({
        score: 10,
        voter: user2.id
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('Popular should see activity of people he follows for his submission', function(done){
      agent
      .get(domainV2 + '/users/' + user1.id + '/follows/activities/page/1')
      .end(function(err, res){
        var activities = res.body;
        expect(res.status).toEqual(200);
        expect(activities.length).toEqual(1);
        expect(activities[0].modelType).toEqual("Ballot");
        expect(activities[0].subject._id).toEqual(user2.id);
        console.log(activities[0]);
        //done();
      });
    });
    it('Nerdy should decline challenge1', function(done){
      agent
      .post(domain + '/challenges/' + challenge1.id + '/declines')
      .send({
        user: user2.id
      })
      .end(function(err, res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('Nerdy checks activity, sees no activity now that challenge is declined', function(done){
      agent
      .get(domainV2 + '/users/' + user2.id + '/follows/activities/page/1')
      .end(function(err, res){
        var activities = res.body;
        expect(res.status).not.toEqual(200);
        done();
      });
    });
    it('Nerdy blocks Popular', function(done){
      agent
      .del(domain + "/users/" + user2.id + '/followers')
      .send({
        user: user1.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('Popular should see activity of people he follows for his submission', function(done){
      agent
      .get(domainV2 + '/users/' + user1.id + '/follows/activities/page/1')
      .end(function(err, res){
        var activities = res.body;
        expect(res.status).not.toEqual(200);
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

var frisby = require('frisby');
var async = require('async');
var superagent = require('superagent');

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
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission
exports.spec = function(domain, callback){
  jasmine.getEnv().defaultTimeoutInterval = 1000;
  async.series([
    function(cb){
      console.log("Starting the activity tests");
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
      //create a user who is friendly, but never invited to challenges
      frisby
      .create("Create A user who is very friendly")
      .post(domain + '/register', {
        username: user4.username,
        password: user4.password,
        email: user4.email
      })
      .expectStatus(200)
      .afterJSON(function(user){
        user4._id = user._id;
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
      describe("Users", function(){
        it("Should allow a very popular user to register", function(done){
          superagent
          .post(domain + "/register")
          .type('form')
          .attach("image", "./tests/specs/images/defaultProfile.png") //this is based on where you are running jasmine-node from
          .field("username", user1.username)
          .field("password", user1.password)
          .field("email", user1.email)
          .end(function(err, res){
            expect(res.status).toEqual(200);
            user1._id = res.body._id;
            done();
            cb(null);
          });
        });
      });
    },
    function(cb){
      describe("Users", function(){
        it("Should allow a very nerdy user to register", function(done){
          superagent
          .post(domain + "/register")
          .type('form')
          .attach("image", "./tests/specs/images/defaultProfile.png") //this is based on where you are running jasmine-node from
          .field("username", user2.username)
          .field("password", user2.password)
          .field("email", user2.email)
          .end(function(err, res){
            expect(res.status).toEqual(200);
            user2._id = res.body._id;
            done();
            cb(null);
          });
        });
      });
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
        invites: [user2._id]
      };
      //popular should see this in activity
      frisby
      .create("Have popular create a challenge")
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
      //have popular submit into a challenge
      //popular should see this in activity
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
      frisby
      .create("Friendly user4 should not see activity of non-friend users when he is not in their challenge")
      .get(domain + '/users/' + user4._id + '/friends/activities/page/1')
      .expectStatus(500)
      .after(function(){
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Nerdy should not see activity of non-friend users who are in his challenges")
      .get(domain + '/users/' + user2._id + '/friends/activities/page/1')
      .expectStatus(500)
      .after(function(){
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Popular can send a friend request to nerdy')
      .post(domain + '/users/' + user2._id + '/friendRequests', {
        friend: user1._id
      })
      .expectStatus(200)
      .after(function(res){
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Nerdy should not see activity of other users who are in his challenges when there is a pending friend request")
      .get(domain + '/users/' + user2._id + '/friends/activities/page/1')
      .expectStatus(500)
      .after(function(){
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Nerdy will go ahead and accept populars friend request')
      .post(domain + '/users/' + user2._id + '/friends', {
        user: user1._id
      })
      .expectStatus(200)
      .after(function(res){
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Nerdy should see activity of other users(popular) who are in his challenges when they are friends")
      .get(domain + '/users/' + user2._id + '/friends/activities/page/1')
      .expectStatus(200)
      .afterJSON(function(activities){
        //should see a challenge creation and challenge submission
        expect(activities.length).toEqual(2);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //setup our challenge
      challenge2 = {
        title: 'Challenge2 Title',
        description: 'Challenge2 Description',
        tags: ['tag1', 'tag2', 'tag3'],
        owner: user4._id,
        privacy: 'private',
        expiration: new Date(2015, 3, 14),
        invites: [user1._id]
      };
      //popular should see this in activity
      frisby
      .create("Have friendly create a challenge")
      .post(domain + '/challenges', challenge2)
      .expectStatus(200)
      .afterJSON(function(challenge){
        expect(challenge._id).toBeDefined();
        challenge2._id = challenge._id;
        cb(null);
      })
      .toss();
    },
    function(cb){
      //have popular submit into another challenge where nerdy isn't invited
      describe("A Submission", function(){
        it("can be submitted by a User (Popular) into challenge 2", function(done){
          superagent
          .post(domain + "/challenges/" + challenge2._id + "/submissions")
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
      frisby
      //share a friendship, not a challenge
      .create("Nerdy should not see activities of Popular's other challenges even though they are friends")
      .get(domain + '/users/' + user2._id + '/friends/activities/page/1')
      .expectStatus(200)
      .afterJSON(function(activities){
        //should see a challenge creation and challenge submission
        expect(activities.length).toEqual(2);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //nerdy vote on popular submission in the challenge
      //popular and nerdy should see this in activity
      frisby
      .create("Have nerdy vote on popular submission")
      .post(domain + '/challenges/' + challenge1._id + '/submissions/' + submission2._id + '/ballots/', {
        score: 10,
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
      frisby
      .create("Popular should see activities of his friend in challenges where he is the owner")
      .get(domain + '/users/' + user1._id + '/friends/activities/page/1')
      .expectStatus(200)
      .afterJSON(function(activities){
        //popular can only see the vote nerdy has made for him
        expect(activities.length).toEqual(1);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //have nerdy comment on submission2, which is popular user's challenge
      //popular and nerdy should see this
      frisby
      .create("Post a new comment to submission1")
      .post(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/comments',{
        commenter: user2._id,
        comment: 'This is a comment by nerdy on popular users challenge'
      })
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(comment){
        expect(comment.commenter).toBeDefined();
        expect(comment.date).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Popular should see activities of his friend in challenges where he is the owner")
      .get(domain + '/users/' + user1._id + '/friends/activities/page/1')
      .expectStatus(200)
      .afterJSON(function(activities){
        //popular can see the comment nerdy made for him
        expect(activities.length).toEqual(2);
        cb(null);
      })
      .toss();
    },
    function(cb){
      cb(null);
    }

  ],
  function(err, results){
    callback(null);
  });
};

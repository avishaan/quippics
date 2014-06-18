var frisby = require("frisby");
var _ = require("underscore");
var async = require("async");

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
//challenge which is public and expired
var challenge1 = {
  title: 'Frisby Challenge 1',
  tags: ['tag1', 'tag2', 'tag3'],
  privacy: 'public',
  expiration: new Date(2013, 10, 15), //this will make it purposely expired so we can test the archive routes
  description: 'Challenge 1 Description',
  invites: []
};
var challenge2 = {};
var challenge3 = {};
var challenge4 = {};

exports.spec = function(domain, callback){
  //set environmental jasmine variables
  jasmine.getEnv().defaultTimeoutInterval = 2000;
  async.series([
    function(cb){
    console.log("Starting the Tests");
    cb(null);
  },
    function(cb){
      console.log("Start deleting db");
      frisby.create("Delete the database")
        .delete(domain + "/api/server")
        .expectStatus(200)
        .afterJSON(function(){
          console.log("Done deleting db");
          cb(null);
        })
        .toss();
  },
    function(cb){
      console.log("Start registering Nerd");
      frisby.create("Register Nerd314")
        .post(domain + "/api/register", user2)
        .expectStatus(200)
        .afterJSON(function(user){
          console.log("Done registering Nerd");
          user2.id = user._id;
          cb(null);
        })
        .toss();
      
  },
    function(cb){
      console.log("Start registering Popular");
      frisby.create("Register Popular123")
        .post(domain + "/api/register", user1)
        .expectStatus(200)
        //.inspectJSON()
        .afterJSON(function(user){
          console.log("Done registering Popular");
          user1.id = user._id;
          cb(null);
        })
        .toss();
    },
    function(cb){
      //challenge: public, not expired, no invites, user1 is owner
      frisby.create("Challenge1: public, not expired, no invites, user1 owns")
        .post(domain + "/api/challenges", {
          title: "Public Challenge No Invites",
          privacy: "public",
          owner: user1.id,
          expiration: new Date(2015, 10, 15)
        })
        .expectStatus(200)
        .afterJSON(function(challenge){
          //save the challenge id for future use
          challenge1.id = challenge._id;
          //our other specs check this, so we don't need to worry about it here
          cb(null);
        })
        .toss();
    },
    function(cb){
      frisby.create("Challenge2: public, expired, no invites, user1 owns")
        .post(domain + "/api/challenges", {
          title: "Challenge2: public, expired, no invites, user1 owns",
          privacy: "public",
          owner: user1.id,
          expiration: new Date(2012, 10, 15)
        })
        .expectStatus(200)
        .afterJSON(function(challenge){
          //save the challenge id for future use
          challenge2.id = challenge._id;
          //our other specs check this, so we don't need to worry about it here
          cb(null);
        })
        .toss();
    },
    function(cb){
      frisby.create("Challenge3: private, not expired, no invites, user1 owns")
        .post(domain + "/api/challenges", {
          title: "Challenge3: private, not expired, no invites, user1 owns",
          privacy: "private",
          owner: user1.id,
          expiration: new Date(2015, 10, 15)
        })
        .expectStatus(200)
        .afterJSON(function(challenge){
          //save the challenge id for future use
          challenge3.id = challenge._id;
          //our other specs check this, so we don't need to worry about it here
          cb(null);
        })
        .toss();
    },
    function(cb){
      frisby.create("Challenge4: private, not expired, user2 invited, user1 owns")
        .post(domain + "/api/challenges", {
          title: "Challenge4: private, not expired, user2 invited, user1 owns",
          privacy: "private",
          owner: user1.id,
          invites: [user2.id],
          expiration: new Date(2015, 10, 15)
        })
        .expectStatus(200)
        .afterJSON(function(challenge){
          //save the challenge id for future use
          challenge4.id = challenge._id;
          //our other specs check this, so we don't need to worry about it here
          cb(null);
        })
        .toss();
    },
    function(cb){
      frisby.create("My Challenges route for user1")
        .get(domain + "/api/users/" + user1.id + "/challenges/page/1")
        .expectStatus(200)
        .afterJSON(function(challenges){
          //save the returned challenges in the user1 object so we can run some tests on it
          user1.myChallenges = challenges; 
          cb(null);
        })
        .toss();
    },
    function(cb){
      frisby.create("My Challenges route for user2")
        .get(domain + "/api/users/" + user2.id + "/challenges/page/1")
        .expectStatus(200)
        .afterJSON(function(challenges){
          //save the returned challenges in the user2 object so we can run some tests on it
          user2.myChallenges = challenges; 
          cb(null);
        })
        .toss();
    },
    function(cb){
      frisby.create("Invited Challenges route for user1")
        .get(domain + "/api/users/" + user1.id + "/challenges/invited/page/1")
        .expectStatus(200)
        .afterJSON(function(challenges){
          //save the returned challenges in the user1 object so we can run some tests on it
          user1.invitedChallenges = challenges; 
          cb(null);
        })
        .toss();
    },
    function(cb){
      frisby.create("Invited Challenges route for user2")
        .get(domain + "/api/users/" + user2.id + "/challenges/invited/page/1")
        .expectStatus(200)
        .afterJSON(function(challenges){
          //save the returned challenges in the user2 object so we can run some tests on it
          user2.invitedChallenges = challenges; 
          cb(null);
        })
        .toss();
    }
  ],
    function(err, results){
      describe("User1, Aka Popular User", function(){
        it("should be able to see challenge1", function(){
          //challenge1 should appear in user1's my challenges
          var find = _.find(user1.myChallenges, function(challenge){
            return challenge._id == challenge1.id;
          });
          expect(find).toBeTruthy();
        });
        it("should not be able to see challenge2 as it is expired", function(){
          var find = _.find(user1.myChallenges, function(challenge){
            return challenge._id == challenge2.id;
          });
          expect(find).toBeFalsy();
        });
        it("should be able to see challenge3 as he is the owner of that private challenge", function(){
          var find = _.find(user1.myChallenges, function(challenge){
            return challenge._id == challenge3.id;
          });
          expect(find).toBeTruthy();
        });
        it("should be able to see challenge4 as he is the owner of a private challenge with invited users", function(){
          var find = _.find(user1.myChallenges, function(challenge){
            return challenge._id == challenge4.id;
          });
          expect(find).toBeTruthy();
        });
        it("should be able to see all the challenges he is invited to", function(){
          expect(user1.invitedChallenges.length).toEqual(0);
        });
      });
      describe("User2, Aka Nerdy User", function(){
        it("should be able to see challenge1 as it is public", function(){
          //challenge1 should appear in user1's my challenges
          var find = _.find(user2.myChallenges, function(challenge){
            return challenge._id == challenge1.id;
          });
          expect(find).toBeTruthy();
        });
        it("should not be able to see challenge2 as it is expired", function(){
          //challenge1 should appear in user1's my challenges
          var find = _.find(user2.myChallenges, function(challenge){
            return challenge._id == challenge2.id;
          });
          expect(find).toBeFalsy();
        });
        it("should not be able to see challenge3 as it is private and user is not invited", function(){
          //challenge1 should appear in user1's my challenges
          var find = _.find(user2.myChallenges, function(challenge){
            return challenge._id == challenge3.id;
          });
          expect(find).toBeFalsy();
        });
        it("should be able to see challenge4 as he was invited to this private challenge", function(){
          //challenge1 should appear in user1's my challenges
          var find = _.find(user2.myChallenges, function(challenge){
            return challenge._id == challenge4.id;
          });
          expect(find).toBeTruthy();
        });
        it("should be able to see all the challenges he is invited to", function(){
          expect(user2.invitedChallenges.length).toEqual(1);
        });
      });
    callback(null);//call the next function in the test specs 
    });
    
};  

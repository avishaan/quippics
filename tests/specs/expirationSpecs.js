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
var challenge2 = {
  title: 'Frisby Challenge newly Expired',
  privacy: 'public',
  expiration: new Date(Date.now())
};
var challenge3 = {
  title: 'Frisby Challenge, 3 second expiration',
  privacy: 'public',
  expiration:  new Date((new Date(Date.now())).setSeconds((new Date(Date.now())).getSeconds()+3))
};
var challenge4 = {
  title: 'Firsby Challenge, not close to expired',
  privacy: 'public',
  expiration: new Date(2015, 10, 15)
};
exports.spec = function(domain, callback){
  //set environmental jasmine variables
  jasmine.getEnv().defaultTimeoutInterval = 3000;
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
      frisby.create("Old ass Challenge")
        .post(domain + "/api/challenges", {
          title: 'Frisby Challenge 1',
          privacy: 'public',
          expiration: new Date(2013, 10, 15), //this will make it purposely expired so we can test the archive routes
          owner: user1.id
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
      frisby.create("Freshly expired challenge")
        .post(domain + "/api/challenges", {
          title: 'Frisby Challenge newly Expired',
          privacy: 'public',
          expiration: new Date(Date.now()),
          owner: user1.id
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
      frisby.create("Challenge is expiring in about 3 seconds, let's check it right now and then in 2 seconds")
        .post(domain + "/api/challenges", {
          title: 'Frisby Challenge, 10 second expiration',
          privacy: 'public',
          expiration:  new Date((new Date(Date.now())).setSeconds((new Date(Date.now())).getSeconds()+1)),
          owner: user1.id
        })
        .expectStatus(200)
        .inspectJSON()
        .afterJSON(function(challenge){
          //save the challenge id for future use
          challenge3.id = challenge._id;
          console.log('now expecting one challenge before it expires');
          frisby.create("Check how many challenges we can see right now")
            .get(domain + "/api/users/" + user1.id + "/challenges/page/1")
            .expectStatus(200)
            //.inspectJSON()
            .afterJSON(function(challenges){
              expect(challenges.length).toEqual(1);
              //now after waiting 2 seconds, it should now be expired
              describe("We now expect this challenge", function(){
                it("to be expired in 2 seconds", function(done){
                  console.log('expecting no challenges after 2 seconds');
                  setTimeout(function(){
                    frisby.create("Check after 1 seconds how many challenges we can now see")
                      .get(domain + "/api/users/" + user1.id + "/challenges/page/1")
                      .expectStatus(404)
                      .inspectJSON()
                      .afterJSON(function(challenges){
                        expect(1).toEqual(1);
                        cb(null);
                      })
                      .toss();
                      done();
                  },2000);
                });
              });
            })
            .toss();
        })
        .toss();
    },
    function(cb){
      frisby.create("Challenge is not even close to expiring")
        .post(domain + "/api/challenges", {
          title: 'Firsby Challenge, not close to expired',
          privacy: 'public',
          expiration: new Date(2015, 10, 15),
          owner: user1.id
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
        .inspectJSON()
        .afterJSON(function(challenges){
          //save the returned challenges in the user1 object so we can run some tests on it
          user1.myChallenges = challenges;
          cb(null);
        })
        .toss();
    }  ],
    function(err, results){
      describe("User1, Aka Popular User", function(){
        it("should be able to see only one challenge", function(){
          expect(user1.myChallenges.length).toEqual(1);
        });
      });
    callback(null);//call the next function in the test specs 
    });
};

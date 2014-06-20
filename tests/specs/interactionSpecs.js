var frisby = require("frisby");
var _ = require("underscore");
var async = require("async");
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
    describe("Users!", function(){
      it("Nerdy should be able to register with a picture", function(done){
        superagent  //Register nerdy, a new user!
        .post(domain + "/register")
        .type('form')
        .attach("image", "./tests/specs/images/defaultProfile.png") //this is based on where you are running jasmine-node from
        .field("username", user2.username)
        .field("password", user2.password)
        .field("email", user2.email)
        .end(function(err, res){
          var user = res.body;
          //make sure something was returned in the response body
          expect(user).toBeDefined();
          expect(user._id).toBeDefined();
          user2.id = user._id;
          //expect the username to be returned
          expect(user.username).toBeDefined();
          //expect 200 response
          expect(res.status).toEqual(200);
          console.log('Done Registering Nerdy');
          done();
          cb(null);
        });
      });
    });
  },
  function(cb){
    describe("Users!", function(){
      it("Popular should be able to register with a picture", function(done){
        superagent
        .post(domain + "/register")
        .type('form')
        .attach("image", "./tests/specs/images/defaultProfile.png") //this is based on where you are running jasmine-node from
        .field("username", user1.username)
        .field("password", user1.password)
        .field("email", user1.email)
        .end(function(err, res){
          var user = res.body;
          //make sure something was returned in the response body
          expect(user).toBeDefined();
          expect(user._id).toBeDefined();
          user1.id = user._id;
          //expect the username to be returned
          expect(user.username).toBeDefined();
          //expect 200 response
          expect(res.status).toEqual(200);
          console.log('Done Registering Popular');
          done();
          cb(null);
        });
      });
    });
  },
  function(cb){
    frisby
    .create('Get specific profile of nerdy')
    .get(domain + '/users/' + user2.id)
    .expectStatus(200)
    .afterJSON(function(profile){
      expect(profile).toBeDefined();
      expect(profile.username).toEqual(user2.username);
      expect(profile._id).toEqual(user2.id);
      expect(profile.rank).toBeDefined();
      expect(profile.thumbnail).toBeDefined();
      cb(null);
    })
    .toss();
  },
  function(cb){
    frisby
    .create('Get list of users from nerdy perspective')
    .get(domain + '/users/' + user2.id + '/users/page/1')
    .expectStatus(200)
    .afterJSON(function(users){
      expect(users.length).toEqual(2)
      expect(users[0]._id).toBeDefined();
      expect(users[0].username).toBeDefined();
      expect(users[0].thumbnail).toBeDefined();
      cb(null);
    })
    .toss();
  },
  function(cb){
    frisby
    .create('Search for popular user')
    .get(domain + '/users/search/' + 'popu')
    .expectStatus(200)
    .afterJSON(function(users){
      expect(users.length).toEqual(1);
      expect(users[0].username).toEqual(user1.username);
      expect(users[0]._id).toEqual(user1.id);
      expect(users[0].thumbnail).toBeDefined();
      cb(null);
    })
    .toss();
  }
  ],
  function(err, results){
    callback(null);//call the next function in the test specs 
  });
};

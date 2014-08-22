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
        expect(users.length).toEqual(2); //remember there is an admin always watching 
        expect(users[1]._id).toBeDefined();
        expect(users[1].username).toBeDefined();
        expect(users[1].thumbnail).toBeDefined();
        expect(_.findWhere(users, {_id: user2.id})).toBeUndefined();//we dont want own user returned in user list
        expect(users.some(function(user){
          return user.friendStatus === 'user';
        })).toEqual(true);//expect one of the users to have a friend flag
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
    },
    function(cb){
      frisby
      .create('Get list of nerdys friends')
      .get(domain + '/users/' + user2.id + '/friends/page/1')
      .expectStatus(200)
      .afterJSON(function(user){
        //nerdy has no friends yet as he has not friended anyone
        expect(user.friends.length).toEqual(0);
        expect(user.friends).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Nerdy wants to be friends with popular, so make a friend request')
      .post(domain + '/users/' + user1.id + '/friendRequests', {
        friend: user2.id
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
      .create('Popular now can check his friend requests')
      .get(domain + '/users/' + user1.id + '/friendRequests/page/1')
      .expectStatus(200)
      .afterJSON(function(user){
        expect(user.friendRequests.length).toEqual(1);
        expect(user.friendRequests[0]._id).toEqual(user2.id);
        expect(user.friendRequests[0].username).toEqual(user2.username);
        expect(user.friendRequests[0].thumbnail).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //we will now have nerdy make a second request
      frisby
      .create('Nerdy is impatient and going to make a second friend request')
      .post(domain + '/users/' + user1.id + '/friendRequests', {
        friend: user2.id
      })
      .expectStatus(500)
      .afterJSON(function(res){
        expect(res.clientMsg).toEqual("Can't make duplicate friend request");
        cb(null);
      })
      .toss();
    },
    function(cb){
      //popular will decline nerdy's request
      frisby
      .create('Popular declines nerdys friend request')
      .post(domain + '/users/' + user1.id + '/declinedRequests', {
        user: user2.id
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
      .create('Popular now can check his friend requests after declining nerdy')
      .get(domain + '/users/' + user1.id + '/friendRequests/page/1')
      .expectStatus(200)
      .afterJSON(function(user){
        expect(user.friendRequests.length).toEqual(0);
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create("Nerdy will try to befriend Popular again")
      .post(domain + '/users/' + user1.id + '/friendRequests', {
        friend: user2.id
      })
      .expectStatus(500)
      .afterJSON(function(res){
        expect(res.clientMsg).toEqual("Can't make duplicate friend request");
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Popular can check his request after nerdy requested popular again, still expect 0')
      .get(domain + '/users/' + user1.id + '/friendRequests/page/1')
      .expectStatus(200)
      .afterJSON(function(user){
        expect(user.friendRequests.length).toEqual(0);
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Popular can send a friend request to nerdy')
      .post(domain + '/users/' + user2.id + '/friendRequests', {
        friend: user1.id
      })
      .expectStatus(200)
      .after(function(res){
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Nerdy can check to see he has a friend request')
      .get(domain + '/users/' + user2.id + '/friendRequests/page/1')
      .expectStatus(200)
      .afterJSON(function(user){
        expect(user.friendRequests.length).toEqual(1);
        expect(user.friendRequests[0]._id).toEqual(user1.id);
        expect(user.friendRequests[0].username).toEqual(user1.username);
        expect(user.friendRequests[0].thumbnail).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Nerdy will go ahead and accept populars friend request')
      .post(domain + '/users/' + user2.id + '/friends', {
        user: user1.id
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
      .create('Lets see whos nerdys friends are')
      .get(domain + '/users/' + user2.id + '/friends/page/1')
      .expectStatus(200)
      .afterJSON(function(user){
        //popular should now show up in his friends list
        expect(user).toBeDefined();
        expect(user.friends).toBeDefined();
        expect(user.friends.length).toEqual(1);
        expect(user.friends[0].username).toEqual(user1.username);
        expect(user.friends[0].thumbnail).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      frisby
      .create('Lets see whos friends with popular')
      .get(domain + '/users/' + user1.id + '/friends/page/1')
      .expectStatus(200)
      .afterJSON(function(user){
        //nerdy should now show up in his friends list
        expect(user).toBeDefined();
        expect(user.friends).toBeDefined();
        expect(user.friends.length).toEqual(1);
        expect(user.friends[0].username).toEqual(user2.username);
        expect(user.friends[0].thumbnail).toBeDefined();
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
        expect(users.length).toEqual(2); //remember there is an admin always watching 
        expect(users[1]._id).toBeDefined();
        expect(users[1].username).toBeDefined();
        expect(users[1].thumbnail).toBeDefined();
        expect(_.findWhere(users, {_id: user2.id})).toBeUndefined();//we dont want own user returned in user list
        expect(users.some(function(user){
          return user.friendStatus === 'friend';
        })).toEqual(true);//expect one of the users to have a friend flag
        cb(null);
      })
      .toss();
    }
  ],
  function(err, results){
    callback(null);//call the next function in the test specs 
  });
};

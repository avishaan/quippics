var frisby = require('frisby');
var async = require('async');

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
var challenge3 = {};
exports.spec = function(domain, callback){
  jasmine.getEnv().defaultTimeoutInterval = 1000;
  async.series([
    function(cb){
      console.log("Starting the tests");
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
        password: user3.password
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
        password: user1.password
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
        password: user2.password
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
      frisby
      .create("Get all the challenges for the nerdy user")
      .get(domain + '/users/' + user2._id + '/challenges/page/1')
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(1);
        expect(challenges[0].participants.length).toEqual(1);
        expect(challenges[0].participants[0].inviteStatus).toEqual('invited'); //right now everyone is only invited
        cb(null);
      })
      .toss();
    },
    function(cb){
      //have nerdy accept the invitation frisby
      frisby
      .create("Have nerdy accept the invitation")
      .post(domain + '/challenges/' + challenge1._id + '/accepts', {
        user: user2._id
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res.clientMsg).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //now see how nerdy's list of challenges look after accepting the challenge
      frisby
      .create("Get all the challenges for the nerdy user")
      .get(domain + '/users/' + user2._id + '/challenges/page/1')
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(1);
        expect(challenges[0].participants.length).toEqual(1);
        expect(challenges[0].numParticipants).toEqual(2);
        expect(challenges[0].unscored).toBeDefined();
        expect(challenges[0].participants[0].inviteStatus).toEqual('accepted'); //right now everyone is only invited
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
        owner: user2._id,
        privacy: 'private',
        expiration: new Date(2015, 3, 14),
        invites: [user1._id, user3._id]
      };
      frisby
      .create("Have that nerdy create a challenge and invite popular")
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
      //popular should now have two challenges, both invited
      frisby
      .create("Get all the challenges for the popular user")
      .get(domain + '/users/' + user1._id + '/challenges/page/1')
      .expectStatus(200)
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(2);
        challenges.forEach(function(challenge, index){
          if (challenge.owner === user1._id){
            expect(challenge.inviteStatus).toEqual('owner');
            expect(challenge.participants).toBeUndefined();
          } else {
            expect(challenge.participants.length).toEqual(1);
            expect(challenge.participants[0].inviteStatus).toEqual('invited');
          }
        });
        cb(null);
      })
      .toss();
    },
    function(cb){
      //check now nerdy should have an additional challenge
      frisby
      .create("Get all the challenges for the nerdy user")
      .get(domain + '/users/' + user2._id + '/challenges/page/1')
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(2);
        expect(challenges[0].participants.length).toEqual(1);
        expect(challenges[0].participants[0].inviteStatus).toEqual('accepted'); //right now everyone is only invited
        cb(null);
      })
      .toss();
    },
    function(cb){
      //now have popular decline this challenge
      frisby
      .create("Have popular decline the invitation")
      .post(domain + '/challenges/' + challenge2._id + '/declines', {
        user: user1._id
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res.clientMsg).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //mr popular now should only have the challenge he is the owner of
      frisby
      .create("Get all the challenges for the popular user")
      .get(domain + '/users/' + user1._id + '/challenges/page/1')
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(1);
        expect(challenges[0].participants).toBeUndefined();
        expect(challenges[0].inviteStatus).toEqual('owner'); //owner shows up as someone who is owner
        cb(null);
      })
      .toss();
    },
    function(cb){
      //setup our challenge
      challenge3 = {
        title: 'Expired Challenge',
        description: 'Challenge3 Description',
        tags: ['tag1', 'tag2', 'tag3'],
        owner: user2._id,
        privacy: 'private',
        expiration: new Date(2012, 3, 14),
        invites: [user1._id, user3._id]
      };
      frisby
      .create("Have nerdy create an expired challenge")
      .post(domain + '/challenges', challenge3)
      .expectStatus(200)
      .afterJSON(function(challenge){
        expect(challenge._id).toBeDefined();
        challenge3._id = challenge._id;
        cb(null);
      })
      .toss();
    },
    function(cb){
      //expired challenge shouldn't show up at all in popular's myChallenges
      frisby
      .create("Get all the challenges for the popular user")
      .get(domain + '/users/' + user1._id + '/challenges/page/1')
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(1);
        expect(challenges[0].participants).toBeUndefined();
        expect(challenges[0].inviteStatus).toEqual('owner'); //owner shows up as someone who is owner
        cb(null);
      })
      .toss();
    },
    function(cb){
      //but the expired challenge should show up in the archive of challenge
      frisby
      .create("Get all archived challenges for a user in this case popular")
      .get(domain + '/users/' + user1._id + '/challenges/archive/page/1')
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(1);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //but lets say that popular had originally declined the challenge
      frisby
      .create("Have popular decline the invitation")
      .post(domain + '/challenges/' + challenge3._id + '/declines', {
        user: user1._id
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res.clientMsg).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //in that case, it shouldn't show up in popular's archive
      frisby
      .create("Get all archived challenges for a user in this case popular")
      .get(domain + '/users/' + user1._id + '/challenges/archive/page/1')
      .expectStatus(404)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges.clientMsg).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //user can hide a challenge so it doesn't appear in their archive
      frisby
      .create("Hide an archived challenge")
      .post(domain + '/challenges/' + challenge3._id + '/hidden', {
        user: user3._id
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res.clientMsg).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //now that the user has hidden their only archive challenge, they should see nothing
      frisby
      .create("Get all archived challenges for a user in this case user3")
      .get(domain + '/users/' + user3._id + '/challenges/archive/page/1')
      .expectStatus(404)
      //.inspectJSON()
      .afterJSON(function(res){
        expect(res).toBeDefined();
        expect(res.clientMsg).toEqual("Couldn't find any challenges for this user");
        cb(null);
      })
      .toss();
    },
    function(cb){
      //nerdy should still be able to see the expired challenge as he is the owner
      frisby
      .create("Get all archived challenges for a user in this case nerdy")
      .get(domain + '/users/' + user2._id + '/challenges/archive/page/1')
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(challenges){
        expect(challenges).toBeDefined();
        expect(challenges.length).toEqual(1);
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get a specific challenge
      frisby
      .create("Get a specific challenge by id")
      .get(domain + '/challenges/' + challenge1._id)
      .expectStatus(200)
      .afterJSON(function(challenge){
        expect(challenge.title).toEqual(challenge1.title);
        expect(challenge.tags[0]).toEqual(challenge1.tags[0]);
        expect(challenge.tags.length).toEqual(challenge1.tags.length);
        expect(challenge.owner).toBeDefined();
        expect(challenge._id).toEqual(challenge1._id);
        expect(challenge.description).toEqual(challenge1.description);
        expect(challenge.createdOn).toBeDefined();
        expect(challenge.expiration).toBeDefined();
        cb(null);
      })
      .toss();
    }

  ],
  function(err, results){
    callback(null);
  });
};

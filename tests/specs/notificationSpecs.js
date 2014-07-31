var frisby = require('frisby');
var async = require('async');
var superagent = require('superagent');
var db = require('../../dbs/db.js');
var agent = require('../../apn/apn.js');
var User = require('../../models/user.js');
var Challenge = require('../../models/challenge.js');


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

agent.on('mock:message', function(raw){
  //console.log(raw);
});
agent.on('queue:drain', function(raw){
  //console.log(raw);
});

exports.spec = function(domain, callback){

  jasmine.getEnv().defaultTimeoutInterval = 2000;
  async.series([
    function(cb){
      console.log("Starting the notification tests");
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
      describe('create users', function(){
        it('user1', function(done){
          User.create({
            username: user1.username,
            password: user1.password,
          }, function(err, user){
            user1._id = user.id;
            done();
          });
        });
        it('user2', function(done){
          User.create({
            username: user2.username,
            password: user2.password,
            email: user2.email
          }, function(err, user){
            user2._id = user.id;
            done();
          });
        });
        it('user3', function(done){
          User.create({
            username: user3.username,
            password: user3.password,
            email: user3.email
          }, function(err, user){
            user3._id = user.id;
            done();
            cb(null);
          });
        });
      });
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
      describe("Notifications", function(){
        it("Should be sent to all challenge invitees", function(done){
          spyOn(agent.queue, 'drain').andCallThrough(); //once messages are done processing
          spyOn(agent, 'send').andCallThrough();
          //setup our challenge
          challenge1 = {
            title: 'Challenge1 Title',
            description: 'Challenge1 Description',
            tags: ['tag1', 'tag2', 'tag3'],
            owner: user1._id,
            privacy: 'private',
            expiration: new Date(2015, 3, 14),
            invites: [user2._id, user3._id],
            //TODO refactor using exports.create
            participants: [
              {
              user: user2._id,
              inviteStatus: 'invited'
            },{
              user: user3._id,
              inviteStatus: 'invited'
            }
            ]
          };

          runs(function(){
            Challenge.create(challenge1, function(err, challenge){
              expect(challenge).toBeDefined();
              challenge1._id = challenge.id;
            });

          });

          waitsFor(function(){
            //this keeps looping around, may want to add tested devices to a list
            //keep going until drain has been called so we know all the messages have processed
            return agent.queue.drain.callCount === 1;
          }, "Expect queue drain to finish and be called", 1000);

          runs(function(){
            //make sure the drain was called once
            console.log("createMessages", agent.send.callCount);
            //make sure the correct number of messages were sent
            expect(agent.send.callCount).toEqual(2);
            //console.log("first call", agent.send.mostRecentCall.args);
            done();
          });
        });
        it("Should not be sent to declined invitees", function(done){
           // expect(mock.payload).toHaveBeenCalled();
           // console.log('called: ', mock.payload.callCount);
          console.log("HERE");
        });
      });
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
    }
  ],
  function(err, results){
    callback(null);
  });
};

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
var challenge1 = {};
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission
exports.spec = function(domain, callback){
  jasmine.getEnv().defaultTimeoutInterval = 1000;
  async.series([
    function(cb){
      console.log("Starting the comments tests");
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
        invites: [user2._id ]
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
      //have nerdy comment on submission1
      frisby
      .create("Post a new comment to submission1")
      .post(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/comments',{
        commenter: user2._id,
        comment: 'This is a comment by nerdy'
      })
      .expectStatus(200)
      .inspectJSON()
      .afterJSON(function(comment){
        expect(comment.commenter).toBeDefined();
        expect(comment.date).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get all the comments for a specific submission
      frisby
      .create("Get a list comments from a submission")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/comments/page/1')
      .expectStatus(200)
      .afterJSON(function(comments){
        //full range of tests here
        expect(comments.length).toEqual(1);
        expect(comments[0]._id).toBeDefined();
        expect(comments[0].comment).toBeDefined();
        expect(comments[0].commenter.username).toEqual('nerd314');
        expect(comments[0].commenter.thumbnail).toBeDefined();
        expect(comments[0].date).toBeDefined();

        cb(null);
      })
      .toss();
    },
    function(cb){
      //have popular comment on submission1
      frisby
      .create("Post a new comment to submission1")
      .post(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/comments',{
        commenter: user1._id,
        comment: 'This is a comment by popular'
      })
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(comment){
        //full range of tests here
        expect(comment.commenter).toBeDefined();
        expect(comment.date).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //get all the comments for a specific submission
      frisby
      .create("Get a list comments from a submission")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/comments/page/1')
      .expectStatus(200)
      .afterJSON(function(comments){
        expect(comments.length).toEqual(2);
        cb(null);
      })
      .toss();
    }
  ],
  function(err, results){
    callback(null);
  });
};

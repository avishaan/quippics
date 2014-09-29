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
      describe("Users", function(){
        it("should allow a user such as nerdy to register with a picture", function(done){
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
            cb(null);
            done();
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
      //.inspectJSON()
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

        //test getting a specific comment (we have a list at this point)
        frisby
        .create("Get a specific comment")
        .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id + '/comments/' + comments[0]._id)
        .expectStatus(200)
        .afterJSON(function(comment){
          expect(comment.comment).toBeDefined();
          expect(comment.commenter).toBeDefined();
          expect(comment._id).toBeDefined();
          expect(comment.modelType).toBeDefined();
          expect(comment.date).toBeDefined();
          cb(null);
        })
        .toss();
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
    },
    function(cb){
      //make sure the submission also has the comment fields
      frisby
      .create("Get a list comments from a submission")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/' + submission1._id)
      .expectStatus(200)
      .afterJSON(function(submission){
        expect(submission.comments.length).toBeDefined();
        expect(submission.comments[0]._id).toBeDefined();
        expect(submission.comments[0].comment).toBeDefined();
        expect(submission.comments[0].date).toBeDefined();
        expect(submission.comments[0].commenter).toBeDefined();
        expect(submission.comments[0].commenter.username).toBeDefined();
        expect(submission.comments[0].commenter._id).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //make sure the correct comment count number is being returned
      frisby
      .create("Get a specific's user submission in a challenge and test the comment number")
      .get(domain + '/challenges/' + challenge1._id + '/submissions/users/' + user2._id)
      .expectStatus(200)
      .afterJSON(function(submission){
        expect(submission.commentCount).toBeDefined();
        expect(submission.commentCount).toEqual(2);
        cb(null);
      })
      .toss();
    }
  ],
  function(err, results){
    callback(null);
  });
};

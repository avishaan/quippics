var frisby = require('frisby');
var superagent = require("superagent"); //we are going to use this when we need to upload multipart forms for picture testing
var randInt = Math.floor(Math.random() * 9999999);
var async = require('async');
//these will be our users for future referencing
var user1 = {
  username: 'jack1985' + randInt,
  password: 'password',
  email: 'jack1985@gmail.com',
  newPassword: 'passwordUpdated' //we use this to send as our new password later on
};
var user2 = {
  username: 'jill1987' + randInt,
  password: 'password',
  email: 'jill1987@gmail.com'
};
var user3 = {
  username: 'sleepyfloydshaan' + randInt,
  password: 'password',
  email: "sleepyfloydshaan@gmail.com"
};

var challenge1 = {
  title: 'Frisby Challenge 1',
  tags: ['tag1', 'tag2', 'tag3'],
  privacy: 'public',
  expiration: new Date(2013, 10, 15), //this will make it purposely expired so we can test the archive routes
  description: 'Challenge 1 Description',
  invites: []
};
var challenge2 = {
  title: 'Frisby Challenge 2',
  //owner: user2._id, //should connect by reference
  tags: ['tag1', 'tag2', 'tag4'],
  privacy: 'public',
  expiration: new Date(2015, 3, 16),
  description: 'Challenge 2 Description',
  invites: []
};
var challenge3 = {
  title: 'Empty Frisby Challenge 3',
  //owner: user2._id, //should connect by reference
  tags: ['tag1', 'tag2', 'tag4'],
  privacy: 'public',
  expiration: new Date(2015, 3, 14),
  description: 'Empty Challenge 3 Description for testing when challenge is empty',
  invites: []
};
var submission1 = {
  //this will be Jack's (User1's) submission into challenge1
  //in the normal test, we would want to send some files over, but for now let's just make a dummy one
};
var submission2 = {
  //This will be Jill's (User2's) submission into challenge1
  //in the normal test, we would want to send some files over, but for now let's just send this dummy one
};
var submission3 = {
  //This will be Shaan's (User3's) submission into challenge1
  //in the normal test, we would want to send some files over, but for now let's just send this dummy one
};
var submission4 = {
  //This will be Jack's (User2's) submission into challenge2
  //in the normal test, we would want to send some files over, but for now let's just send this dummy one
};
var ballot1 = {
  //ballot that Jack will vote on for submission1 (Jack's)
  score: 8
};
var ballot2 = {
  //ballot that Jill will vote on for submission1 (Jack's)
  score: 9
};
var ballot3 = {
  //ballot that Shaan will vote on for submission1 (Jack's)
  score: 10
};
var ballot4 = {
  //ballot that Jack will vote on for submission2 (Jill's)
  score: 8
};
var comment1 = { //comment for submission1, this eventually gets deleted
  _id: '123',
  comment: "First comment"
};
var comment2 = {
  comment: "Another Comment"
};


exports.spec = function(domain){

  describe("Epic App", function(){
    it("should be able to delete the database via a route", function(){
      frisby.create("Delete the models in the database")
        .delete(domain + "/api/server")
        .expectStatus(200)
        //.inspectJSON()
        .expectJSONTypes({
          users: Number,
          submissions: Number,
          challenges: Number,
          ballots: Number,
          activities: Number,
          comments: Number
        })
        .toss();
    });
    it("should be able to be able to register/signup", function(){
      frisby.create('Register Jack, a new user')
        //calling post method and sending user information
        .post(domain + "/api/register", user1)
        .expectStatus(200)
        .expectJSON({
          username: user1.username,
          email: user1.email
        })
        .afterJSON(function(user){
          expect(user).toBeDefined();
          //save the returned user information into the variable
          user1._id = user._id;
          //make sure the password is returned
          expect(user.password).toBeDefined();
          //make sure the returned password isn't the same otherwise it may not have been hashed
          expect(user.password).not.toEqual(user1.password);
          //go ahead and try to update Jack's information
          //it("should be able to update user information", function(){
          //update all the user information
          user1.username = user1.username + "update";
          user1.email = user1.email + "update";
          //make sure we can get the userid from a successful user login
          frisby.create('Authenticate a user and return back the userid')
            .post(domain + '/api/users', user3)
            .expectStatus(200)
            .expectJSON({
              //make sure when we send the username we get a userid back
              _id: user3._id
            })
            .toss();
          //update the information right after
          superagent//Update Jack's user information, include a picture this time
            .put(domain + "/api/users/" + user1._id)
            .type('form')
            .attach("image", "./app/images/onepixel.png")
            .field("username", user1.username)
            .field("password", user1.password)
            .field('newPassword', user1.newPassword)
            .end(function(err, res){
              var user = res.body;
              //make sure something was returned in the response body
              expect(user).toBeDefined();
              expect(user._id).toBeDefined();
              //expect the username to be returned
              expect(user.username).toBeDefined();
              //expect the email to be there
              expect(user.email).toBeDefined();
              //an image should have been returned
              expect(user.image).toBeDefined();
              //expect the same id returned
              expect(user._id).toEqual(user1._id);
              //expect 200 response
              expect(res.status).toEqual(200);
            });
        })
        //.inspectJSON()
        .toss();
      superagent  //Register Jill, a new User
        .post(domain + "/api/register")
        .type('form')
        .attach("image", "./app/images/onepixel.png")
        .field("username", user2.username)
        .field("password", user2.password)
        .field("email", user2.email)
        .end(function(err, res){
          var user = res.body;
          //make sure something was returned in the response body
          expect(user).toBeDefined();
          expect(user._id).toBeDefined();
          //expect the username to be returned
          expect(user.username).toBeDefined();
          //an image should have been returned
          expect(user.image).toBeDefined();
          //expect 200 response
          expect(res.status).toEqual(200);
          //save the user's userid for future reference
          user2._id = user._id;
        });
      frisby.create('Register Shaan, a new user')
        //calling post method and sending user information
        .post(domain + "/api/register", user3)
        .expectStatus(200)
        .expectJSON({
          username: user3.username
        })
        .afterJSON(function(user){
          expect(user).toBeDefined();
          //save the returned user information into the variable
          user3._id = user._id;
          //now test the challenges after setting up the users
          //it("Should not let a duplicate username register", function(){
          frisby.create("Register a new user with an existing username")
            .post(domain + "/api/register", {
              username: user3.username,
              password: "nonsensepassword",
              email: "whatever@gmail.com"
            })
            .expectStatus(500)
            .toss();
          //});

          testChallenges();

        })
        .toss();

    });
    it("Should be able to use the status route as a heartbeat making sure the server is up and running", function(){
      frisby.create("GET status of server")
        .get(domain + "/api/server")
        .expectStatus(200)
        .toss();
    });

  });

  //we had to split the test challenges so we could easily (and cleanly) nest it after making the users
  var testChallenges = function(){

    describe("A Challenge", function(){
      it("should have a username", function(){
        expect(user1.username).toBeDefined();
      });
      it("can be created by a User (Jack)", function(){
        //have Jack create a new challenge
        challenge1.owner = user1._id;
        //add user2 as an invite to challenge1
        challenge1.invites.push(user2._id);
        //add user3 as an invite to challenge1
        challenge1.invites.push(user3._id);
        frisby.create('POST a new challenge')
          .post(domain + "/api/challenges", challenge1)
          .expectStatus(200)
          .expectJSONTypes({
            invites: Array //make sure the returned invites is of type array
          })
          .afterJSON(function(challenge){
            //keep the challenge id for future use
            challenge1._id = challenge._id;
            //expect the returned title to be the same as the sent title
            expect(challenge.title).toEqual(challenge1.title);
            //sent owner should be the same as returned owner
            expect(challenge.owner).toEqual(challenge1.owner);
            //sent tags should be the same as returned tags
            expect(challenge.tags).toEqual(challenge1.tags);
            //sent description should be same as returned description
            expect(challenge.description).toEqual(challenge1.description);
            //make sure the privacy type is returned
            expect(challenge.privacy).toEqual(challenge1.privacy);
            //make sure something is sent back for the following
            expect(challenge.submissions).toBeDefined();
            //make sure a date was returned
            expect(challenge.createdOn).toBeDefined();
            //make sure an expiration date was returned
            expect(challenge.expiration).toBeDefined();
          })
          //.inspectJSON()
          .toss();
      });
      //have Jack create the empty challenge
      challenge3.owner = user1._id;
      frisby.create('POST a new empty challenge for testing')
        .post(domain + "/api/challenges", challenge3)
        .expectStatus(200)
        .afterJSON(function(challenge){
          //keep the challenge id for future use
          challenge3._id = challenge._id;
          //expect the returned title to be the same as the sent title
          expect(challenge.title).toEqual(challenge3.title);
          //make sure something is sent back for the following
          expect(challenge.submissions).toBeDefined();
          //make sure a date was returned
          expect(challenge.createdOn).toBeDefined();
          //make sure an expiration date was returned
          expect(challenge.expiration).toBeDefined();
        })
        .toss();
      it("can be created by a User (Jill)", function(){
        //have Jill create a new challenge
        challenge2.owner = user2._id;
        frisby.create('POST a new challenge')
          .post(domain + "/api/challenges", challenge2)
          .expectStatus(200)
          .afterJSON(function(challenge){
            challenge2._id = challenge._id;
            //expect the returned title to be the same as the sent title
            expect(challenge.title).toEqual(challenge2.title);
            //sent owner should be the same as returned owner
            expect(challenge.owner).toEqual(challenge2.owner);
            //sent tags should be the same as returned tags
            expect(challenge.tags).toEqual(challenge2.tags);
            //sent description should be same as returned description
            expect(challenge.description).toEqual(challenge2.description);
            //make sure the privacy type is returned
            expect(challenge.privacy).toEqual(challenge2.privacy);
            //make sure something is sent back for the following
            expect(challenge.submissions).toBeDefined();
            //make sure a date was returned
            expect(challenge.createdOn).toBeDefined();
            //make sure an expiration date was returned
            expect(challenge.expiration).toBeDefined();

            //invite some users to the challenge, needs to be done here because we need the challenge ids
            frisby.create('invite multiple users to challenge2')
              .put(domain + "/api/challenges/" + challenge2._id + '/invites',{
                invites: [user1._id, user3._id]
              })
              .expectStatus(200)
              .expectJSONTypes({
                invites: Array
              })
              .afterJSON(function(challenge){
                expect(challenge.invites).toBeDefined();
                expect(challenge.invites.length).toBeGreaterThan(1);
                challenge2.invites = challenge.invites;
                //see the full list of users invited to a challenge
                frisby.create('List users already invited to a challenge')
                  .get(domain + "/api/challenges/" + challenge2._id + '/invites')
                  .expectStatus(200)
                  .expectJSONTypes({
                    invites: Array
                  })
                  //.inspectJSON()
                  .afterJSON(function(challenge){
                    expect(challenge.invites.length).toBeGreaterThan(1);
                    //number of invites returned should be the same as the number we got last time which is the number we added
                    expect(challenge.invites).toEqual(challenge2.invites);

                  })
                  .toss();
              })
              .toss();

            //now that we have the challenges setup, let's get all the users to post something to the first challenge
            testSubmissions();
          })
          .toss();
      });
    });
  };

  //we split the submissions test for clarity sake
  var testSubmissions = function(){

    describe("A Submission", function(){
      it("can be submitted by a User (Jack) into challenge 1", function(){
        superagent
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions")
          .type('form')
          .attach("image", "./app/images/onepixel.png")
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
          });
      });
      it("can be submitted by a User (Jack) into challenge 2", function(){
        superagent
          .post(domain + "/api/challenges/" + challenge2._id + "/submissions")
          .type('form')
          .attach("image", "./app/images/onepixel.png")
          .field("owner", user1._id)
          .end(function(err, res){
            var submission = res.body;
            //make sure something was returned in the response body
            expect(submission).toBeDefined();
            //make sure the id in the response body was returned
            expect(submission._id).toBeDefined();
            //expect 200 response
            expect(res.status).toEqual(200);
            submission4._id = submission._id;
            //console.log("here is the returned superagent submission");
            //console.log(submission);
          });
      });
      it("can be submitted by a User (Jill) into challenge 1", function(){
        superagent
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions")
          .type('form')
          .attach("image", "./app/images/onepixel.png")
          .field("owner", user2._id)
          .end(function(err, res){
            var submission = res.body;
            //make sure something was returned in the response body
            expect(submission).toBeDefined();
            //make sure the id in the response body was returned
            expect(submission._id).toBeDefined();
            //expect 200 response
            expect(res.status).toEqual(200);
            submission2._id = submission._id;
          });
      });
      it("should return a known error when retrieving top submission when none exist", function(){
        frisby.create('GET list of top submission when none exist in the challenge')
          .get(domain + "/api/challenges/" + challenge3._id + "/submissions/top")
          .expectStatus(404)
          .toss();
      });
      it("can't be submitted by a User (Jill) into challenge 1 a second time", function(){
        frisby.create('POST a new submission')
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions", {
            owner: user2._id
          })
          .expectStatus(409)
          .toss();
      });
      it("can be submitted by a User (Shaan) into challenge 1", function(){
        superagent
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions")
          .type('form')
          .attach("image", "./app/images/onepixel.png")
          .field("owner", user3._id)
          .end(function(err, res){
            var submission = res.body;
            //make sure something was returned in the response body
            expect(submission).toBeDefined();
            //make sure the id in the response body was returned
            expect(submission._id).toBeDefined();
            //expect 200 response
            expect(res.status).toEqual(200);
            submission3._id = submission._id;
          });
        frisby.create("List of challenges where a user has entered a submission in")
          .get(domain + "/api/users/" + user1._id + "/challenges/submitted")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(challenges){
            //more than 1 challenge should be returned
            expect(challenges.length).toBeGreaterThan(1);
            challenges.forEach(function(element, index, array){
              //the returned challenges should only contain the _id of the challenge
              expect(challenges[index]._id).toBeDefined();
              //should contain the title of the challenge
              expect(challenges[index].title).toBeDefined();
              //should contain the time the match ends
              expect(challenges[index].expiration).toBeDefined();
              //the name of the challenge
              expect(challenges[index].title).toBeDefined();
              //thumbnail of the submission
              expect(challenges[index].submissions[0].thumbnail).toBeDefined();
              //rank of the user's image
              expect(challenges[index].submissions[0].rank).toBeGreaterThan(-1);
              //score of the user's image
              expect(challenges[index].submissions[0].score).toBeDefined();
              //ending time of the challenge
              expect(challenges[index].expiration).toBeDefined();
            });
          })
          .toss();
        frisby.create('List of challenges I am invited to') //doing this again so we can make sure images are returned
          .get(domain + "/api/users/" + user3._id + "/challenges/invited/page/1")
          .expectStatus(200)
          .expectJSONTypes({
          })
          //.inspectJSON()
          .afterJSON(function(challenges){
            //console.log('HERE');
            //we know Shaan was invited to both challenges
            expect(challenges.length).toBeGreaterThan(0);
            //we want a submission returned, as the user entered the first one //todo get rid of this order dependence
            expect(challenges[0].submissions).toBeDefined();
            //we don't want to know who else was invited
            expect(challenges[0].invites).toBeUndefined();
            //we want to make sure the id is returned
            expect(challenges[0]._id).toBeDefined();
            //the first challenge returned shouldn't have a thumbnail because the user didn't enter anything into that
            expect(challenges[0].submissions[0]).not.toBeDefined();
            //expect a thumbnail to be returned
            //expect(challenges[0].submissions[0].thumbnail).toBeDefined();
            //expect the owner of the challenge with the thumbnail definied to be this user
            //expect(challenges[1].submissions[0].owner).toEqual(user3._id);
            //expect the expiration date to be returned
            //expect(challenges[1].expiration).toBeDefined();
          })
          .toss();
        frisby.create('List of challenges Jack is either invited to, or is public, or is mine, which are not expired') //doing this again so we can make sure images are returned
          .get(domain + "/api/users/" + user1._id + "/challenges/page/1")
          .expectStatus(200)
          .expectJSONTypes({
          })
          //.inspectJSON()
          .afterJSON(function(challenges){
            //console.log('HERE');
            //we know Shaan was invited to both challenges
            expect(challenges.length).toBe(2);
            //we want a submission returned, as the user entered the first one //todo get rid of this order dependence
            expect(challenges[1].submissions).toBeDefined();
            //we don't want to know who else was invited
            expect(challenges[1].invites).toBeUndefined();
            //we want to make sure the id is returned
            expect(challenges[1]._id).toBeDefined();
            expect(challenges[1].submissions.length).toEqual(1);
            expect(challenges[1].submissions[0].thumbnail).toBeDefined();
            expect(challenges[1].title).toBeDefined();
          })
          .toss();
        //find List of submissions the user (Jack) has entered in
        frisby.create("List of submissions the user has entered in")
          .get(domain + "/api/users/" + user1._id + "/submissions")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(submissions){
            //more than 1 challenge should be returned
            expect(submissions.length).toBeGreaterThan(1);
            //the returned submissions should only contain the _id of the challenge
            expect(submissions[0]._id).toBeDefined();
          })
          .toss();
        //now that we have our submissions we need to vote on them
        testBallots();
      })
    });

  };


  //test voting by voting on one submission and submitting ballots for that
  var testBallots = function(){
    describe("A Ballot", function(){
      it("can be used to allow a User (Jack) to vote on a particular submission (Jack's)", function(){
        frisby.create("POST a ballot")
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/ballots", {
            voter: user1._id,
            score: ballot1.score
          })
          .expectStatus(200)
          .afterJSON(function(ballot){
            expect(ballot).toBeDefined();
            ballot1._id = ballot.id;
          })
          //.inspectJSON()
          .toss();
      });
      it("can be used to allow a User (Jack) to vote on a particular submission (Jill's)", function(){
        frisby.create("POST a ballot")
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission2._id + "/ballots", {
            voter: user1._id,
            score: ballot4.score
          })
          .expectStatus(200)
          .afterJSON(function(ballot){
            expect(ballot).toBeDefined();
            ballot4._id = ballot.id;
          })
          .toss();
      });
      it("can be used to allow a User (Jill) to vote on a particular submission (Jack's)", function(){
        frisby.create("POST a ballot")
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/ballots", {
            voter: user2._id,
            score: ballot2.score
          })
          .expectStatus(200)
          .afterJSON(function(ballot){
            expect(ballot).toBeDefined();
            ballot2._id = ballot.id;
          })
          .toss();
      });
      it("can be used to allow a User (Shaan) to vote on a particular submission (Jack's)", function(){
        frisby.create("POST a ballot")
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/ballots", {
            voter: user3._id,
            score: ballot3.score
          })
          .expectStatus(200)
          .afterJSON(function(ballot){
            expect(ballot).toBeDefined();
            ballot3._id = ballot.id;
            testUsers();
          })
          .toss();
      });
    });
  };

  //we should be able to test the things users can do, like find other users, find friends, etc etc
  var testUsers = function(){
    describe("A User (Jack)", function(){
      it('should be able to see a list of users', function(){
        frisby.create("GET all the users")
          .get(domain + "/api/users/page/1")
          .expectStatus(200)
          //.inspectJSON()
          .expectJSONTypes({
            //users: Array
          })
          .afterJSON(function(users){
            expect(users.length).toBe(4);
            //make sure the response is an array of users
            expect(users).toEqual(jasmine.any(Array));
            //make sure the users have a thumbnail, we happen to know the second returned user has
            expect(users[1].thumbnail).toBeDefined();
          })
          .toss();
      });
      it('should be able to search for the username of Jack', function(){
        frisby.create("Search for Jack")
          .get(domain + "/api/users/search/jack")
          .expectStatus(200)
          //.inspectJSON()
          .expectJSONTypes({
            //users: Array
          })
          .afterJSON(function(users){
            expect(users.length).toBe(1);
            //make sure the response is an array of users
            expect(users).toEqual(jasmine.any(Array));
            //make sure the users have a thumbnail, we happen to know the second returned user has
            expect(users[0].thumbnail).toBeDefined();
          })
          .toss();
      });
      it("should be able to see Jill's profile information", function(){
        frisby.create("GET the profile of a specific person")
          .get(domain + "/api/users/" + user2._id)
          .expectStatus(200)
          .expectJSONTypes({
            username: String,
            email: String,
            thumbnail: Object
          })
          .afterJSON(function(profile){
          })
          .toss();
      });
      it("should be able to read a specific challenge", function(){
        frisby.create("GET the challenge information for a specific challenge")
          .get(domain + "/api/challenges/" + challenge1._id)
          .expectStatus(200)
          .expectJSONTypes({
            tags: Array,
            submissions: Array,
            owner: String,
            description: String,
            title: String,
            _id: String
          })
          .afterJSON(function(challenge){
          })
          .toss();
      });
      it("should be able to read a specific submission", function(){
        frisby.create('GET a specific submission')
          .get(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id)
          .expectStatus(200)
          //.inspectJSON()
          .expectJSONTypes({
            _id: String,
            owner: String,
            ballots: Array,
            createdOn: String,
            rank: Number,
            thumbnail: {
              data: String
            }
          })
          .expectJSON({
            _id: submission1._id,
            owner: user1._id //make sure it matches Jack's id as this would be his submission
          })
          .afterJSON(function(submission){
            expect(submission.ballots.length).toEqual(3); //we expect there to be 3 ballots/votes at this time
            expect(submission.score).toEqual(9); //make sure it is calculating the score correctly
            expect(submission.image).toBeDefined(); //make sure the image is returned
          })
          .toss();
      });
      it("should be able to read all the submission for a specific challenge", function(){
        frisby.create('GET all the submission for a specific challenge')
          .get(domain + "/api/challenges/" + challenge1._id + "/submissions/page/1")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(submissions){
            expect(submissions).toEqual(jasmine.any(Array));
            expect(submissions.length).toEqual(3); //we expect there to be 3 elements in the array from the 3 submissions by each person
            expect(submissions[0].thumbnail).toBeDefined(); //we expect a thumbnail passed back
            expect(submissions[0].image).not.toBeDefined(); //we don't expect the original image to be passed back
          })
          .toss();
      });
      it("should be able to see all the submissions Jack have voted on for a specific challenge so far", function(){
        frisby.create('GET all the submissions Jack has voted for so far in a specific challenge')
          .get(domain + "/api/challenges/" + challenge1._id + "/submissions/users/" + user1._id + "/voted")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(submissions){
            //make sure an array of submissions is returned
            expect(submissions).toEqual(jasmine.any(Array));
          })
          .toss();
      });
      it("should be able to return the submission of a specific user in a challenge", function(){
        frisby.create("GET the submission that Jack submitted in a specific challenge")
          .get(domain + "/api/challenges/" + challenge1._id + "/submissions/users/" + user1._id)
          .expectStatus(200)
          //.inspectJSON()
          .expectJSON({
            _id: submission1._id, //we know Jack submitted submission1, so let's make sure that's what we got back
            owner: user1._id,
            rank: 1
          })
          .afterJSON(function(submission){
            expect(submission.ballots).toBeDefined();
            expect(submission.createdOn).toBeDefined();
            expect(submission.ballots).toEqual(jasmine.any(Array));
          })
          .toss();
      });
      it("should be able to gracefully error when retrieving the submission of a specific user in a challenge and no submission for that user exists", function(){
        frisby.create("GET the submission that Jill submitted in a specific challenge when no submission for her in the challenge exists")
          .get(domain + "/api/challenges/" + challenge2._id + "/submissions/users/" + user2._id)
          .expectStatus(404)
          //.inspectJSON()
          .expectJSON({
            //_id: submission1._id, //we know Jack submitted submission1, so let's make sure that's what we got back
            //owner: user1._id,
            //rank: 1
          })
          .afterJSON(function(){
          })
          .toss();
      });
      it("should be able to return a subset of challenges, in that case 10 challenges", function(){
        frisby.create("GET some challenges")
          .get(domain + "/api/challenges/page/1")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(challenges){
            //should only return 24 challenges at most
            expect(challenges.length).toBeLessThan(24);
            //max of one submission should be returned with each challenge
            expect(challenges[0].submissions.length).toEqual(1);
            //thumbnail should be populated with each submission
            expect(challenges[0].submissions[0].thumbnail).toBeDefined();
          })
          .toss();
      });
      it("should be able to return a list of expired submissions (archive) for a specific user, Jack", function(){
        frisby.create("GET archive of submissions")
          .get(domain + "/api/users/" + user1._id + "/submissions/archive/page/1")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(challenges){
            //make sure some challenges were returned
            expect(challenges).toBeDefined();
            expect(challenges).toEqual(jasmine.any(Array));
            expect(challenges.length).toBeGreaterThan(0);
            challenges.forEach(function(element, index, array){
              //make sure we have the expiration date of the challenge
              expect(challenges[index].expiration).toBeDefined();
              expect(challenges[index].title).toBeDefined();
              //we want the users submission for the challenge returned
              expect(challenges[index].submissions[0]).toBeDefined();
              //we want the score of that submission
              expect(challenges[index].submissions[0].score).toBeDefined();
              //we want the thumbnail of that submission
              expect(challenges[index].submissions[0].thumbnail).toBeDefined();
              //make sure the submission has a rank
              expect(challenges[index].submissions[0].rank).toBeGreaterThan(0);
            });
            
          })
          .toss();
      });
      it("should be able to return the top rated submission (Jack's) from challenge1", function(){
        frisby.create("GET top rated submission")
          .get(domain + "/api/challenges/" + challenge1._id + "/submissions/top")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(submission){
            //return should have score average, submission owner
            //we know Jack would be the owner of the winning submission
            expect(submission.owner).toEqual(user1.username);
            //we also know that his submission is the one that won, so we expect those ids to match
            expect(submission._id).toEqual(submission1._id);
            //we don't need the ballots, so we don't expect to see them
            expect(submission.ballots).not.toBeDefined();
            //we want the image returned as well
            expect(submission.image).toBeDefined();
            testComments();
          })
          .toss();
      });


    });
  };
  var testComments = function(){
    describe("Comments", function(){
      it("should be able to add a comment to a submission1", function(){
        frisby.create("POST a comment2 to a submission1")
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/comments", {
            commenter: user3._id,
            comment: comment2.comment
          })
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(comment){
            expect(comment[0]._id).toBeDefined();
            //make sure the right comment was returned back, there is some array manipulation that makes it a little iffy
            expect(comment[0].title).toEqual(comment2.title);
            comment2._id = comment[0]._id;
            expect(comment[0].commenter.username).toBeDefined();
          })
          .toss();
      });
      it("should be able to comment on a submission", function(){
        frisby.create("POST a comment1 to a submission1")
          .post(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/comments", {
            commenter: user2._id,
            comment: comment1.comment
          })
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(comment){
            expect(comment[0]._id).toBeDefined();
            comment1._id = comment[0]._id;
            //now that we have a comment, go ahead and see if we can retrieve a specific comment and delete it
            describe("Known existing comments can be manipulated which", function(){
              it("should allow us to read a specific comment", function(){
                frisby.create("GET a specific comment")
                  .get(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/comments/" + comment1._id)
                  .expectStatus(200)
                  //.inspectJSON()
                  .afterJSON(function(comment){
                    expect(comment).toBeDefined();
                    expect(comment._id).toBeDefined();
                    expect(comment.commenter).toBeDefined();
                    expect(comment.comment).toBeDefined();
                  })
                  .toss();
              });
              it("should be able to retrieve all the comments on a submission", function(){
                frisby.create("GET all comments from a submission")
                  .get(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/comments")
                  .expectStatus(200)
                  //.inspectJSON()
                  .afterJSON(function(comments){
                    expect(comments).toEqual(jasmine.any(Array));
                    expect(comments.length).toBeGreaterThan(0);
                    expect(comments[0].commenter).toBeDefined();
                    expect(comments[0].commenter.username).toEqual(user3.username);
                  })
                  .toss();
              });
              it("should allow us to delete a specific comment", function(){
                frisby.create("DELETE a specific comment from a submission")
                  .delete(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/comments/" + comment1._id)
                  .expectStatus(204)
                  .after(function(){
                  })
                  .toss();
              });
              it("should confirm that we deleted that specific comment", function(){
                frisby.create("GET a comment that no longer exists")
                  .get(domain + "/api/challenges/" + challenge1._id + "/submissions/" + submission1._id + "/comments/" + comment1._id)
                  .expectStatus(404)
                  .after(function(){
                    testActivities()
                  })
                  .toss();
              });

            });
          })
          .toss();
      });

    });
  };
  var testActivities = function(){
    describe("Activities", function(){
      it("should be able to see all the activities", function(){
        frisby.create("GET all the activities")
          .get(domain + "/api/activities/page/1")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(activities){
            //make sure the correct number of activities were returned
            //we have a maximum of 24 set per page
            expect(activities.length).toBeLessThan(24);

            //run tests based on the type of activity
            activities.forEach(function(activity, array, index){
              //full images should never be sent through
              //never send an image in the owner
              //make sure we have an owner before testing, we won't have one everytime
              if (activity.owner){expect(activity.owner.image).toBeUndefined();}
              //never send an image in the subject
              expect(activity.subject.image).toBeUndefined();
              //never send an image in the object
              //make sure we have an object before testing, we won't have one everytime
              if (activity.object) { expect(activity.object.image).toBeUndefined();}
              //never send an image in the submissions reference
              //make sure we have a submission before testing, we won't have one everytime
              if (activity.references.submission) {expect(activity.references.submission.image).toBeUndefined();}
              //we will always have a sentence, make sure it's defined
              expect(activity.sentence).toBeDefined();
              //console.log(activity.sentence);

              switch (activity.modelType)
              {
                case "Submission":
                  //A submission based activity should have the correct model type
                  expect(activity.modelType).toEqual("Submission");
                  //the subject should be a user type
                  expect(activity.subject).toBeDefined();
                  //the username should be in the subject so we know
                  expect(activity.subject.username).toBeDefined();
                  //we should have a reference to the challenge title
                  expect(activity.references.challenge.title).toBeDefined();
                  //we should know whose challenge this was submitted to
                  expect(activity.references.challenge.owner).toBeDefined();
                  //we should have the expiration date
                  expect(activity.references.challenge.expiration).toBeDefined();
                  //challenge id should be passed to the front end so they can allow the user to work in the challenge
                  expect(activity.references.challenge._id).toBeDefined();
                  //submission id should be passed to the front end so they can allow the user to work in the challenge
                  expect(activity.references.submission._id).toBeDefined();

                  break;
                case "Challenge":
                  expect(activity.subject).toBeDefined();
                  expect(activity.subject.username).toBeDefined();
                  expect(activity.references.challenge.title).toBeDefined();
                  expect(activity.references.challenge.expiration).toBeDefined();
                  //challenge id should be passed to the front end so they can allow the user to work in the challenge
                  expect(activity.references.challenge._id).toBeDefined();
                  break;
                case "Ballot":
                  expect(activity.subject).toBeDefined();
                  expect(activity.subject.username).toBeDefined();
                  expect(activity.object).toBeDefined();
                  expect(activity.object.username).toBeDefined();
                  expect(activity.references.challenge.title).toBeDefined();
                  expect(activity.score).toBeDefined();
                  //challenge id should be passed to the front end so they can allow the user to work in the challenge
                  expect(activity.references.challenge._id).toBeDefined();
                  //submission id should be passed to the front end so they can allow the user to work in the challenge
                  expect(activity.references.submission._id).toBeDefined();
                  break;
                case "Comment":
                  expect(activity.subject).toBeDefined();
                  expect(activity.subject.username).toBeDefined();
                  expect(activity.object).toBeDefined();
                  expect(activity.object.username).toBeDefined();
                  //submission id should be passed to the front end so they can allow the user to work in the challenge
                  expect(activity.references.submission._id).toBeDefined();
                  break;
                default:
                  //we should never end up here, it means we have a rogue activity
                  expect(true).toEqual(false); //this is to alert us that we have some odd error
                  break;

              }
            });
            testFriends();
            

          })
          .toss();
      });
    });
  };
  var testFriends = function(){
    describe("Friending", function(){
      async.series([
      //it("should allow Jack (user1) to request the friendship of Jill (user2), and prevent duplicates while allowing Jill to get a second request", function(){
        frisby.create("POST send a friend request")
          .post(domain + "/api/users/" + user1._id + "/requests", {
            request: user2._id
          })
          .expectStatus(200)
          .after(function(){

          })
          .toss(),
      //}),
      //it("should allow Jill to see all of her requests, in this case there should only be one from Jack", function(){
        //when we get Jill's list of requests, we expect to see one request
        frisby.create("GET all of jill's requests")
          .get(domain + "/api/users/" + user2._id + "/requests")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(user){
            //the following items should not be returned with the user
            expect(user.thumbnail).toBeUndefined();
            expect(user.image).toBeUndefined();
            expect(user.email).toBeUndefined();
            expect(user.password).toBeUndefined();
            expect(user.firstName).toBeUndefined();
            //we should see Jack's request in Jill's list of requests
            expect(user.requests.length).toEqual(1);
            expect(user.requests[0].username).toEqual(user1.username);
            //we should all the detail in the list of friends returned
            expect(user.requests[0].thumbnail).toBeDefined();
            expect(user.requests[0].username).toBeDefined();
            expect(user.requests[0].createdOn).toBeDefined();
            expect(user.requests[0].image).toBeUndefined();
          })
          .toss(),
      //}),
      //it("should again allow Jack (user1) to request the friendship of Jill (user2) a second time", function(){
        frisby.create("POST send a friend request to Jill again")
          .post(domain + "/api/users/" + user1._id + "/requests", {
            request: user2._id
          })
          .expectStatus(200)
          .after(function(){

          })
          .toss(),
      //}),
      //it("when we get Jill's list of requests, we expect to still see one request showing it didn't duplicate the request", function(){
        frisby.create("GET all of jill's requests, should be no duplicate")
          .get(domain + "/api/users/" + user2._id + "/requests")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(user){
            //the following items should not be returned with the user
            expect(user.thumbnail).toBeUndefined();
            expect(user.image).toBeUndefined();
            expect(user.email).toBeUndefined();
            expect(user.password).toBeUndefined();
            expect(user.firstName).toBeUndefined();
            //we should see Jack's request in Jill's list of requests
            expect(user.requests.length).toEqual(1);
            expect(user.requests[0].username).toEqual(user1.username);
            //we should all the detail in the list of friends returned
            expect(user.requests[0].thumbnail).toBeDefined();
            expect(user.requests[0].username).toBeDefined();
            expect(user.requests[0].createdOn).toBeDefined();

          })
          .toss(),
      //}),=
      //it("should allow sleepyfloydshaan (user3) to request the friendship of Jill (user2)", function(){
        frisby.create("POST send a friend request")
          .post(domain + "/api/users/" + user3._id + "/requests", {
            request: user2._id
          })
          .expectStatus(200)
          .after(function(){
          })
          .toss(),
      //}),
      //it("when we get Jill's list of requests, we expect to see two friend requests now", function(){
        //
        frisby.create("GET all of jill's requests")
          .get(domain + "/api/users/" + user2._id + "/requests")
          .expectStatus(200)
          //.inspectJSON()
          .afterJSON(function(user){
            //the following items should not be returned with the user
            expect(user.thumbnail).toBeUndefined();
            expect(user.image).toBeUndefined();
            expect(user.email).toBeUndefined();
            expect(user.password).toBeUndefined();
            expect(user.firstName).toBeUndefined();
            //we should see Jill now has two friend requests
            expect(user.requests.length).toEqual(2);
          })
          .toss(),
      //}),
      //xit("Jill should be able to accept Jack's friend request", function(){
        frisby.create("POST accept a friend")
          .post(domain + "/api/users/" + user2._id + "/accepts", {
            friend: user1._id
          })
          .expectStatus(200)
          .after(function(){

          })
          .toss(),
      //}),
      //xit("Should allow us to see Jack as one of Jill's friends. She should only have one at this time, Jack being the one", function(){
        frisby.create("GET the list of friends that jill has")
          .get(domain + "/api/users/" + user2._id + "/friends")
          .expectStatus(200)
          .afterJSON(function(user){
            //dont return sensitive user information
            expect(user.thumbnail).toBeUndefined();
            expect(user.image).toBeUndefined();
            expect(user.email).toBeUndefined();
            expect(user.password).toBeUndefined();
            expect(user.firstName).toBeUndefined();
            //Jill should have one friend
            expect(user.friends.length).toEqual(1);
            //Jill's friend should be Jack
            expect(user.friends[0]._id).toEqual(user1._id);
            //and all Jack's information
            expect(user.friends[0].username).toEqual(user1.username); 
            //we should all the detail in the list of friends returned
            expect(user.friends[0].thumbnail).toBeDefined();
            expect(user.friends[0].username).toBeDefined();
            expect(user.friends[0].createdOn).toBeDefined();
            expect(user.friends[0].image).toBeUndefined();
          })
          .toss(),
      //}),
      //xit("Jack should not be able to add Sleepyfloydshaan as a friend since there is no invite", function(){
        frisby.create("POST to try and accept a friend without a request, this will fail")
          .post(domain + "/api/users/" + user1._id + "/accepts", {
            friend: user3._id
          })
          .expectStatus(404)
          .toss(),
      //}),
      //xit("should be able to see Jack's friend list", function(){
        frisby.create("GET the list of friends")
          .get(domain + "/api/users/" + user1._id + "/friends")
          .expectStatus(200)
          .afterJSON(function(user){
            expect(user.friends.length).toEqual(1);
            expect(user.friends.length).not.toBeNull();
            expect(user.friends.length).not.toBeUndefined();
            expect(user.friends).toEqual(jasmine.any(Object));
          })
          .toss(),
        //Jack can add sleepyfoydshaan directly to his own friend list this way
        frisby.create("POST to add a friend without triggering a request, this is more like twitter follow")
          .post(domain + "/api/users/" + user1._id + "/friends", {
            friend: user3._id
          })
          .expectStatus(200)
          .expectJSON({
            friend: String
          })
          .toss(),
        //get Jack's friend list, shaan should be there now
        frisby.create("GET Jack's friend list")
          .get(domain + "/api/users/" + user1._id + "/friends")
          .expectStatus(200)
          .afterJSON(function(user){
            expect(user.friends.length).toEqual(2);
            expect(user.friends.length).not.toBeNull();
            expect(user.friends.length).not.toBeUndefined();
            expect(user.friends).toEqual(jasmine.any(Object));
          })
          .toss(),
        //Jack can add sleepyfoydshaan again, should not duplicate
        frisby.create("POST to add a friend without triggering a request, this is more like twitter follow, this should not duplicate")
          .post(domain + "/api/users/" + user1._id + "/friends", {
            friend: user3._id
          })
          .expectStatus(200)
          .toss(),
        //get Jack's friend list, shaan should be there only once
        frisby.create("GET Jack's friend list again, no duplicates")
          .get(domain + "/api/users/" + user1._id + "/friends")
          .expectStatus(200)
          .afterJSON(function(user){
            expect(user.friends.length).toEqual(2);
            expect(user.friends.length).not.toBeNull();
            expect(user.friends.length).not.toBeUndefined();
            expect(user.friends).toEqual(jasmine.any(Object));
          })
          .toss()
      //})
      ]);
    });
  };

};

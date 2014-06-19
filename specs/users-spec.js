var frisby = require('frisby');
var domain = 'http://localhost:8081/api/v1';
var async = require('async');
var superagent = require('superagent');

var user1 = {
  username: 'user1',
  password: 'password1',
  email: 'email@yahoo.com'
};

async.series([
  function(cb){
    describe("Clear the database", function(){
      it("should have the ability to be cleared with a remote call", function(){
        frisby
          .create('Clear the database via a REST call')
          .delete(domain + '/server')
          .expectStatus(200)
          .expectJSONTypes({
            users: Number
          })
          .toss();
      });
    });
    cb(null);
  },
  function(cb){
    describe("Users", function(){
      it("should have the ability to register", function(){
        //user should be able to register without a picture and with a picture
        frisby.create('Register User1')
          .post(domain + '/register', {
            username: user1.username,
            password: user1.password,
            email: user1.email
          })
          .expectStatus(200)
          .afterJSON(function(res){
            expect(res.username).toEqual(user1.username);
            expect(res.password).toBeUndefined();
            expect(res.email).toBeUndefined();
          })
          .toss();
      });
      it("should allow a user to register with an image", function(){
        //users should be able to register with a picture
      superagent  //Register Jill, a new User
        .post(domain + "/register")
        .type('form')
        .attach("image", "./specs/images/onepixel.png") //this is based on where you are running jasmine-node from
        .field("username", 'user2')
        .field("password", 'password2')
        .field("email", 'email@gmail.com')
        .end(function(err, res){
          var user = res.body;
          //make sure something was returned in the response body
          expect(user).toBeDefined();
          //expect(user._id).toBeDefined();
          //expect the username to be returned
          expect(user.username).toBeDefined();
          //an image should have been returned
          //expect(user.image).toBeDefined();
          //expect 200 response
          expect(res.status).toEqual(200);
          //save the user's userid for future reference
          //user2._id = user._id;
        });
      })
      it("should not have the ability to register with the same username", function (){
        //user should not be able to register with the same username as a duplicate user
        frisby.create('Register user1 again')
          .post(domain + '/register', {
            username: user1.username,
            password: user1.password,
            email: user1.email
          })
          .expectStatus(500)
          .toss();

      });
      it("should be able to login with the correct credentials", function(){
        //user should be able to login
        frisby.create('Login user1')
          .post(domain + '/users', {
            username: user1.username,
            password: user1.password
          })
          .expectStatus(200)
          .afterJSON(function(res){
            expect(res._id).toBeDefined();
          })
          .toss();
      });
      it('should not be able to login with the wrong credentials', function(){
        //user should not be able to login with the wrong credentials
        frisby.create('Login user1 with wrong password')
          .post(domain + '/users', {
            username: user1.username,
            password: 'badpassword'
          })
          .expectStatus(401)
          .toss();
      });
      it('should be able to login with the username in the wrong case', function(){
        //user should be able to login with the username in the wrong case
        frisby.create('Login user1 with all uppercase username')
          .post(domain + '/users', {
            username: user1.username.toUpperCase(),
            password: user1.password
          })
          .expectStatus(200)
          .toss();
      });
      it('should not allow registration with the same username but different case', function(){
        //user should not be able to register with the same username but a different case
        frisby.create('Register user1 with all uppercase username')
          .post(domain + '/register', {
            username: user1.username.toUpperCase(),
            password: user1.password,
            email: user1.email
          })
          .expectStatus(500)
          .toss();
      });
    });
    cb(null);
  }
]);

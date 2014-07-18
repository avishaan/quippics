var frisby = require('frisby');
var async = require('async');
var superagent = require('superagent');

var user1 = {
  username: 'user1',
  password: 'password1',
  email: 'email@yahoo.com'
};
var user2 = {
  username: 'user2',
  password: 'password2',
  email: 'email2@gmail.com'
}
exports.spec = function(domain, callback){

  async.series([
    function(cb){
    frisby
    .create('Clear the database via a REST call')
    .delete(domain + '/server')
    .expectStatus(200)
    .expectJSONTypes({
      users: Number
    })
    .afterJSON(function(res){
      cb(null);
    })
    .toss();
    },
    function(cb){
      //user should be able to register without a picture and with a picture
      frisby.create('Register User1')
      .post(domain + '/register', {
        username: user1.username,
        password: user1.password,
        email: user1.email
      })
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(res){
        expect(res.username).toEqual(user1.username);
        expect(res.password).toBeUndefined();
        expect(res._id).toBeDefined();
        user1._id = res._id;
        expect(res.email).toBeUndefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      describe("Users", function(){
        it("should allow a user to register with an image", function(done){
          //users should be able to register with a picture
          superagent  //Register Jill, a new User
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
            user2._id = user._id;
            //expect the username to be returned
            expect(user.username).toBeDefined();
            //an image should have been returned
            //expect(user.image).toBeDefined();
            //expect 200 response
            expect(res.status).toEqual(200);
            //save the user's userid for future reference
            //user2._id = user._id;
            done();
            cb(null);
          });
        });
      });
    },
    function(cb){
      frisby
      .create('Get user2 profile information')
      .get(domain + '/users/' + user2._id)
      .expectStatus(200)
      //.inspectJSON()
      .afterJSON(function(profile){
        expect(profile.username).toEqual(user2.username);
        expect(profile.password).toBeUndefined();
        expect(profile._id).toEqual(user2._id);
        expect(profile.email).toEqual(user2.email);
        expect(profile.thumbnail).toBeDefined();
        //save the thumbnail for when we update the user thumbnail later
        user2.thumbnail = profile.thumbnail;
        cb(null);
      })
      .toss();
    },
    function(cb){
      //user should not be able to register with the same username as a duplicate user
      frisby.create('Register user1 again')
      .post(domain + '/register', {
        username: user1.username,
        password: user1.password,
        email: user1.email
      })
      .expectStatus(500)
      .after(function(){
        cb(null);
      })
      .toss();

    },
    function(cb){
      //user should be able to login
      frisby.create('Login user1')
      .post(domain + '/users', {
        username: user1.username,
        password: user1.password
      })
      .expectStatus(200)
      .afterJSON(function(res){
        expect(res._id).toBeDefined();
        cb(null);
      })
      .toss();
    },
    function(cb){
      //user should not be able to login with the wrong credentials
      frisby.create('Login user1 with wrong password')
      .post(domain + '/users', {
        username: user1.username,
        password: 'badpassword'
      })
      .expectStatus(401)
      .after(function(){
        cb(null);
      })
      .toss();
    },
    function(cb){
      //user should be able to login with the username in the wrong case
      frisby.create('Login user1 with all uppercase username')
      .post(domain + '/users', {
        username: user1.username.toUpperCase(),
        password: user1.password
      })
      .expectStatus(200)
      .after(function(){
        cb(null);
      })
      .toss();
    },
    function(cb){
      //user should not be able to register with the same username but a different case
      frisby.create('Register user1 with all uppercase username')
      .post(domain + '/register', {
        username: user1.username.toUpperCase(),
        password: user1.password,
        email: user1.email
      })
      .expectStatus(500)
      .after(function(){
        cb(null);
      })
      .toss();
    },
    function(cb){
      describe("Users", function(){
        it("should allow a user to change image", function(done){
          //user should be able to change profile picture after registering
          superagent
          .put(domain + '/users/' + user2._id)
          .type('form')
          .attach("image", "./tests/specs/images/onepixel.png") //this is based on where you are running jasmine-node from
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
            //expect(user.image).toBeDefined();
            //expect 200 response
            expect(res.status).toEqual(200);
            //save the user's userid for future reference
            //user2._id = user._id;
            done();
            frisby
            .create('Get user2 profile information')
            .get(domain + '/users/' + user2._id)
            .expectStatus(200)
            //.inspectJSON()
            .afterJSON(function(profile){
              //make sure the thumbnail data has changed
              expect(profile.thumbnail.data).not.toEqual(user2.thumbnail.data);
              cb(null);
            })
            .toss();
          });
        });
      });
    },
    function(cb){
      //user should be able to change their password
      user1.password = 'newpassword';
      user1.email = 'newemail@gmail.com';

      frisby.create('Have user1 change their password')
      .put(domain + '/users/' + user1._id, {
        newPassword: user1.password,
        email: user1.email
      })
      .expectStatus(200)
      .afterJSON(function(user3){
        //check that we can still log in with the updated user
        frisby.create('User should be able to login with new password')
        .post( domain + '/users', {
          username: user1.username,
          password: user1.password
        })
        .expectStatus(200)
        .afterJSON(function(res){
          expect(res._id).toBeDefined();
          cb(null);
        })
        .toss();
      })
      .toss();
    }
  ],
  function(err, results){
    //callback(null);
  });
};


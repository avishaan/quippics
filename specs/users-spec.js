var frisby = require('frisby');
var baseDomain = 'http://localhost:8080/api/v1';
var async = require('async');


async.series([
  function(cb){
    describe("The database", function(){
      it("should have the ability to be cleared with a remote call", function(){
        frisby
          .create('Clear the database via a REST call')
          .delete(baseDomain + '/server')
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
    describe("Mark(id:1) on facebook", function(){
      it("should be able to be a supporter for Shaan(id:2) on facebook, even though neither have 'profiles' yet", function(){
        frisby
          .create('Support a receiver without having either in the DB')
          .post(baseDomain + '/users/facebook/1/supporters', {
            support: 2,
            network: 'facebook'
          })
          .expectStatus(200)
          .inspectJSON()
          .toss();
      });
      it("should be able to see how many people support Shaan(id:2) by querying his facebook id", function(){
        frisby
          .create('See how many people support a user')
          .get(baseDomain + '/users/facebook/2/supporters')
          .expectStatus(200)
          //.inspectJSON()
          .expectJSON({
            supportersCount: 1
          })
          .expectJSONTypes({
            supportersCount: Number
          })
          .toss();
      });
    });
    cb(null);
  },
  function(cb){
    describe("Bob(id:3) on facebook", function(){
      it("should be able to be a supporter for Shaan(id:2) on facebook, even though Bob has no profile yet", function(){
        frisby
          .create('Support a receiver without having a profile yourself while the receiver does have a profile')
          .post(baseDomain + '/users/facebook/3/supporters', {
            support: 2,
            network: 'facebook'
          })
          .expectStatus(200)
          .inspectJSON()
          .toss();
      });
      it("should be able to see how many people support Shaan(id:2) by querying his facebook id", function(){
        frisby
          .create('See how many people support a user')
          .get(baseDomain + '/users/facebook/2/supporters')
          .expectStatus(200)
          //.inspectJSON()
          .expectJSON({
            supportersCount: 2
          })
          .expectJSONTypes({
            supportersCount: Number
          })
          .toss();
      });
    });
    cb(null);
  },
  function(cb){
    describe("Mark(id:1) on facebook", function(){
      it("should also be able to see how many people support Shaan(id:2) on facebook", function(){
        frisby
          .create("See how many people support a user")
          .get(baseDomain + '/users/facebook/2/supporters')
          .expectStatus(200)
          .expectJSON({
            supportersCount: 2
          })
          .expectJSONTypes({
            supportersCount: Number
          })
          .toss();
      });
    });
    cb(null);
  },
  function(cb){
    describe("Mark(id:1) on facebook", function(){
      it("should also be able to see how many people support Bob(id:3) on facebook when Bob has no supporters", function(){
        frisby
          .create("See how many people support a user")
          .get(baseDomain + '/users/facebook/3/supporters')
          .expectStatus(200)
          .expectJSON({
            supportersCount: 0
          })
          .expectJSONTypes({
            supportersCount: Number
          })
          .toss();
      });
      it("should also be able to see how many people support a nonexistant User(id:4) on facebook when user doesn't exist in system", function(){
        frisby
          .create("See how many people support a user")
          .get(baseDomain + '/users/facebook/4/supporters')
          .expectStatus(200)
          .expectJSON({
            supportersCount: 0
          })
          .expectJSONTypes({
            supportersCount: Number
          })
          .toss();
      });
    });
    cb(null);
  }
]);

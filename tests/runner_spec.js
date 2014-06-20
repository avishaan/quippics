//set this to your testing domain
var domain = 'http://localhost:8081/api/v1';

//var inviteSpec = require('./specs/inviteSpecs.js');
//var epicSpec = require('./specs/epicSpecs.js');
//var expirationSpec = require('./specs/expirationSpecs.js');
var userSpec = require('./specs/userSpecs.js');
var interactionSpec = require('./specs/interactionSpecs.js');
//var superSpec = require('./specs/superTest.js');
var async = require('async');


async.series([
  function(cb){
    userSpec.spec(domain, function(){
      cb(null);
    });
  },
  function(cb){
    interactionSpec.spec(domain, function(){
      cb(null);
    });
  }
],
  function(err, results){
    //epicSpec.spec(domain); //we run this one last because this set of tests is meant to run last and has no way for a callback
  }
);
//require('./specs/basic_spec.js'); //basic spec
//require('./specs/userAPI_spec.js').spec(domain);
//var prepare = require('./specs/mongooseSeed.js').cleanUp();
//inviteSpec.spec(domain, function(){
//  epicSpec.spec(domain);
//});//the call back let's the next spec run in order
//inviteSpec.asyncTest(domain);
//epicSpec.spec(domain);
//superSpec.spec(domain);
//require('./specs/debug_spec.js').spec(domain);

//potentially seed mongoose db directly without routes
//set this to your testing domain
var domain = 'http://admin:admin@localhost:8081/api/v1';
var domainV2 = 'http://admin:admin@localhost:8081/api/v2';

//var inviteSpec = require('./specs/inviteSpecs.js');
//var epicSpec = require('./specs/epicSpecs.js');
//var expirationSpec = require('./specs/expirationSpecs.js');
var userSpec = require('./specs/userSpecs.js');
var interactionSpec = require('./specs/interactionSpecs.js');
var challengeSpec = require('./specs/challengeSpecs.js');
var submissionSpec = require('./specs/submissionSpecs.js');
var ballotSpec = require('./specs/ballotSpecs.js');
var activitySpec = require('./specs/activitySpecs.js');
var activityFilterSpec = require('./specs/activityFilterSpecs.js');
var commentSpec = require('./specs/commentSpecs.js');
var notificationSpec = require('./specs/notificationSpecs.js');
var submissionFlagSpec = require('./specs/submissionFlagSpecs.js');
var challengePersistSpec = require('./specs/challengePersistSpecs.js');
var followSpec = require('./specs/followSpecs.js');
var challengeV2Spec = require('./specs/challengeV2Specs.js');
var submissionV2Spec = require('./specs/submissionV2Specs.js');
var ballotV2Spec = require('./specs/ballotV2Specs.js');
//var superSpec = require('./specs/superTest.js');
var async = require('async');


async.series([
// function(cb){
//   console.log("Calling User Specs");
//   userSpec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Challenge Specs");
//   challengeSpec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling ChallengeV2 Specs");
//   challengeV2Spec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Follow Specs");
//   followSpec.spec(domain, function(){
//     cb(null);
//   });
// },
//  function(cb){
//    console.log("Calling Interaction/Public Challenge Specs");
//    interactionSpec.spec(domain, function(){
//      cb(null);
//    });
//  },
// function(cb){
//   console.log("Calling Submission Specs");
//   submissionSpec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling SubmissionV2 Specs");
//   submissionV2Spec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Ballot Specs V2");
//   ballotV2Spec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Ballot Specs");
//   ballotSpec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Activity Filter Specs");
//   activityFilterSpec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Activity Specs");
//   activitySpec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Comment Specs");
//   commentSpec.spec(domain, function(){
//     cb(null);
//   });
// },
//  function(cb){
//    console.log("Calling Persisted Challenge Specs");
//    challengePersistSpec.spec(domain, function(){
//      cb(null);
//    });
//  },
// function(cb){
//   console.log("Calling Notification Specs");
//   notificationSpec.spec(domain, function(){
//     cb(null);
//   });
// },
// function(cb){
//   console.log("Calling Submission Flag Specs");
//   submissionFlagSpec.spec(domain, function(){
//     cb(null);
//   });
// }
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

var frisby = require('frisby');

exports.spec = function(){frisby.create('basic twitter test')
//Calling get method
.get('https://api.twitter.com/1/statuses/user_timeline.json?screen_name=anyname')
//Verifying expected outcomes
  .expectStatus(410)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('errors.*',{
    message: String
  })
  .expectJSON('errors.*',{
    code: 74
  })
  .toss();
}(); //run the function right away after defining it
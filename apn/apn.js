var apnagent = require('apnagent');
var path = require('path');
var config = require('../conf/config.js');

if (config.env === 'prod'){
  var agent = module.exports = new apnagent.Agent();
} else if (config.env === 'local'){
  var agent = module.exports = new apnagent.MockAgent();
} else {
  var agent = module.exports = new apnagent.Agent();
  agent
  .enable('sandbox');
}

//set the credentials
agent
.set('pfx file', path.join(process.cwd(), config.pfxPath));
//credentials were for development

agent.
  connect(function(err){
  // handle any auth problems
  if (err && err.name === 'GatewayAuthorizationError'){
    console.log('Authentication Error: %s', err.message);
    process.exit(1);
  }
  else if (err) {
    //handle other errors
    throw err;
  } else {
    // it worked, don't be so surprised...
    var env = agent.enabled('sandbox') ? 'sandbox' : 'production';
    console.log('apnagent [%s] gateway connected', env);
  }
});

var npmInfo = require('../package.json');

module.exports = function(){
  console.log("Node Env Variable: " + process.env.NODE_ENV);

  // istanbul ignore next: don't look at the env variables
  switch(process.env.NODE_ENV){
    case null:
    case undefined:
    case "local":
      return {
        dbURI : "mongodb://localhost/" + npmInfo.name,
        expressPort: 8081,
        env: 'local', //should be env/prod
        logentriesToken: '',
        pfxPath: '/conf/cert/pfx-local.p12'
      };
    case "dev":
    case "development":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'dev', //should be env/prod
        logentriesToken: 'bb995abb-8007-4433-a2af-ea7deba119cf',
        pfxPath: '/conf/cert/pfx-dev.p12'
      };
    case "test":
    case "testing":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'dev', //should be env/prod, can be changed to prod when we are comfy with prod environ
        logentriesToken: process.env.LOGENTRIES_TOKEN,
        pfxPath: '/conf/cert/pfx-test.p12'
      };
    case "prod":
    case "production":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'dev', //should be env/prod, can be changed to prod when we are comfy with prod environ
        logentriesToken: process.env.LOGENTRIES_TOKEN,
        pfxPath: '/conf/cert/pfx-prod.p12'
      };
    default:
      throw new Error("No Environment Found");

  }
}();

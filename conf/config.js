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
        pfxPath: '/conf/cert/pfx-local.p12',
        loggerLevel: 'info'
      };
    case "dev":
    case "development":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'dev', //should be env/prod
        logentriesToken: 'bb995abb-8007-4433-a2af-ea7deba119cf',
        loaderioVerficationLink: process.env.LOADERIO_VERIFICATION_LINK,
        pfxPath: '/conf/cert/pfx-dev.p12',
        loggerLevel: 'info'
      };
    case "test":
    case "testing":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'test', //should be env/prod, can be changed to prod when we are comfy with prod environ
        logentriesToken: process.env.LOGENTRIES_TOKEN,
        nodetimeToken: process.env.NODETIME_ACCOUNT_KEY,
        loaderioToken: process.env.LOADERIO_API_KEY,
        loaderioVerficationLink: process.env.LOADERIO_VERIFICATION_LINK,
        pfxPath: '/conf/cert/pfx-test.p12',
        loggerLevel: 'debug'
      };
    case "prod":
    case "production":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'prod', //should be env/prod, can be changed to prod when we are comfy with prod environ
        logentriesToken: process.env.LOGENTRIES_TOKEN,
        nodetimeToken: process.env.NODETIME_ACCOUNT_KEY,
        loaderioToken: process.env.LOADERIO_API_KEY,
        loaderioVerficationLink: process.env.LOADERIO_VERIFICATION_LINK,
        pfxPath: '/conf/cert/pfx-prod.p12',
        loggerLevel: 'error'
      };
    default:
      throw new Error("No Environment Found");

  }
}();

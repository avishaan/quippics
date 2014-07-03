var npmInfo = require('../package.json');

module.exports = function(){
  console.log("Node Env Variable: " + process.env.NODE_ENV);



  switch(process.env.NODE_ENV){
    case null:
    case undefined:
    case "dev":
    case "development":
      return {
        dbURI : "mongodb://localhost/" + npmInfo.name,
        expressPort: 8081,
        env: 'dev' //should be env/prod
      };
    case "test":
    case "testing":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'dev', //should be env/prod, can be changed to prod when we are comfy with prod environ
        logentriesToken: process.env.LOGENTRIES_TOKEN
      };
    case "prod":
    case "production":
      return {
        dbURI : process.env.MONGODB_URI,
        expressPort: process.env.PORT,
        env: 'dev', //should be env/prod, can be changed to prod when we are comfy with prod environ
        logentriesToken: process.env.LOGENTRIES_TOKEN
      };
    default:
      throw new Error("No Environment Found");

  }
}();

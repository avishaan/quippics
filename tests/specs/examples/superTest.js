var superagent = require("superagent");


exports.spec = function(domain){

  describe("supertest test testing", function(){
    var username = "avishaan" + Math.floor(Math.random()*9999999999);
    it("should be able to register/signup", function(done){
      superagent
        .post(domain + "/api/register")
        .send({
          username: username,
          password: 'password',
          email: 'avishaan@Mercid.com'
        })
        .end(function(err, res){
          console.log(res.body);
          done();
        });

    });
    it("should be able to upload a file", function(done){
      superagent
        .post(domain + "/api/challenges/10000000000/submissions")
        .type('form')
        .attach("image", "./app/images/defaultSubmission.jpg")
        .field('owner', '1000000000')
        .end(function(err, res){
          console.log(res.body);
          done();
        });
    })
  });
};
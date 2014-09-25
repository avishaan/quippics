var frisby = require('frisby');
var async = require('async');
var _ = require('underscore');
var superagent = require('superagent');
var db = require('../../dbs/db.js');
var User = require('../../models/user.js');
var Challenge = require('../../models/challenge.js');
var Submission = require('../../models/submission.js');
var mailers = require('../../mail/mailers.js');
var transporter = require('../../mail/transporter.js');


var user1 = {
  username: 'popular123',
  password: '123',
  email: 'popular123@gmail.com',
};

var user2 = {
  username: 'nerd314',
  password: '314',
  email: 'nerd314@gmail.com',
};
var user3 = {
  username: 'user3',
  password: 'password',
  email: 'user3@gmail.com',
};
var user4 = {
  username: 'douche',
  password: 'password',
  email: 'sleepyfloydshaan@gmail.com',
};
var challenge1 = {};
var challenge2 = {};
var submission1 = {}; //not widely accepted submission
var submission2 = {}; //great submission

exports.spec = function(domain, callback){

  jasmine.getEnv().defaultTimeoutInterval = 2000;

  console.log('Running Submission Flag Tests');
  describe('The test setup', function(){
    it('should be able to delete the database', function(done){
      superagent
      .del(domain + "/server")
      .end(function(res){
        expect(res.status).toEqual(200);
        console.log("Done deleting db");
        done();
      });
    });
    it('should create a user', function(done){
      console.log('after delete');
      User.create({
        username: user1.username,
        password: user1.password,
        email: user1.email
      }, function(err, user){
        expect(user).toBeDefined();
        user1.id = user.id;
        done();
      });
    });
    it('should create another user', function(done){
      User.create({
        username: user2.username,
        password: user2.password,
        email: user2.email
      }, function(err, user){
        expect(user).toBeDefined();
        user2.id = user.id;
        done();
      });
    });
    it('should create another user', function(done){
      User.create({
        username: user3.username,
        password: user3.password,
        email: user3.email
      }, function(err, user){
        expect(user).toBeDefined();
        user3.id = user.id;
        done();
      });
    });
    it('should create another user', function(done){
      User.create({
        username: user4.username,
        password: user4.password,
        email: user4.email
      }, function(err, user){
        expect(user).toBeDefined();
        user4.id = user.id;
        done();
      });
    });
    it('should invite all the users into a challenge and have them accept', function(done){
      Challenge.create({
        title: 'Challenge Title',
        description: 'Challenge Description',
        owner: user3.id,
        invites: [user1.id, user2.id, user3.id, user4.id],
        privacy: 'public',
        expiration: new Date(2015, 3, 14),
        participants: [{
          user: user1.id,
          inviteStatus: 'accepted'
        },{
          user: user2.id,
          inviteStatus: 'accepted'
        },{
          user: user3.id,
          inviteStatus: 'owner'
        },{
          user: user4.id,
          inviteStatus: 'accepted'
        }]
      }, function(err, challenge){
        console.log(err);
        challenge1.id = challenge.id;
        expect(challenge.id).toBeDefined();
        expect(err).toEqual(null);
        done();
      });
    });
    it('should have user1 enter a submission', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/tinyimg.png")
      .field("owner", user1.id)
      .end(function(err, res){
        var submission = res.body;
        //make sure something was returned in the response body
        expect(submission).toBeDefined();
        //make sure the id in the response body was returned
        expect(submission._id).toBeDefined();
        //expect 200 response
        expect(res.status).toEqual(200);
        submission1.id = submission._id;
        //console.log("here is the returned superagent submission");
        //console.log(submission);
        done();
      });
    });
    it('should have user2 comment on submission 1', function(done){
      superagent
      .post(domain + "/challenges/" +challenge1.id + "/submissions/" + submission1.id + '/comments')
      .send({
        commenter: user2.id,
        comment: 'A good comment'
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should have user1 comment on submission 1', function(done){
      superagent
      .post(domain + "/challenges/" +challenge1.id + "/submissions/" + submission1.id + '/comments')
      .send({
        commenter: user1.id,
        comment: 'A good comment'
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should have user4 (douche) comment on submission 1', function(done){
      superagent
      .post(domain + "/challenges/" +challenge1.id + "/submissions/" + submission1.id + '/comments')
      .send({
        commenter: user4.id,
        comment: 'My potentially offensive comment'
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should have user4 (douche) enter an inappropriate submission', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + "/submissions")
      .type('form')
      .attach("image", "./tests/specs/images/tinyimg.png")
      .field("owner", user4.id)
      .end(function(err, res){
        var submission = res.body;
        //make sure something was returned in the response body
        expect(submission).toBeDefined();
        //make sure the id in the response body was returned
        expect(submission._id).toBeDefined();
        //expect 200 response
        expect(res.status).toEqual(200);
        submission2.id = submission._id;
        //console.log("here is the returned superagent submission");
        //console.log(submission);
        done();
      });
    });
  });
  describe('Flagging of a submission1', function(){
    //this image is appropriate, the moderator will not confirm this image is bad
    it('should be allowed by a user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions/' + submission1.id + '/flags')
      .send({
        flagger: user1.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should be allowed by a second user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions/' + submission1.id + '/flags')
      .send({
        flagger: user2.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should be allowed by a third user triggering email of submission to moderator', function(done){
      spyOn(mailers, 'moderateSubmission');
      Submission.flag({
        submissionId: submission1.id,
        flagger: user3.id
      }, function(err, submission){
        expect(mailers.moderateSubmission).toHaveBeenCalled();
        done();
      });
    });
  });
  describe('Flagging of a submission2', function(){
    it('should be allowed by a user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions/' + submission2.id + '/flags')
      .send({
        flagger: user1.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should be allowed by a second user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions/' + submission2.id + '/flags')
      .send({
        flagger: user2.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('shouldnt be impacted by a user flagging for a second time' , function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions/' + submission2.id + '/flags')
      .send({
        flagger: user2.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        Submission
        .findOne({'_id': submission2.id})
        .exec(function(err, submission){
          //find the submission and count the number of flags, make sure only at two
          expect(submission.flaggers.length).toEqual(2);
          done();
        });
      });
    });
    it('should be allowed by a third user', function(done){
      superagent
      .post(domain + "/challenges/" + challenge1.id + '/submissions/' + submission2.id + '/flags')
      .send({
        flagger: user3.id,
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        Submission
        .findOne({'_id': submission2.id})
        .exec(function(err, submission){
          //find the submission and count the number of flags, make sure only at two
          expect(submission.flaggers.length).toEqual(3);
          done();
        });
        done();
      });
    });
  });
  describe('A Moderator should be able deem a submission unacceptable', function(){
    it('simulate the moderator keeping submission1', function(done){
      expect(false).toEqual(true);
      done();
    });
  });
  describe('A submission deemed unacceptable by a moderator', function(){
    it('simulates the moderator removing submission2 and emailing user the TOS', function(done){
      //TODO we never tested the actual rest interface
      spyOn(mailers, 'mailUserTerms').andCallThrough();
      spyOn(transporter, 'sendMail');
      runs(function(){
        //remove the flagged submission
        Submission.removeFlagged({
          submissionId: submission2.id
        });
      });
      waitsFor(function(){
        //keep going until drain has been called so we know all the messages have processed
        return mailers.mailUserTerms.callCount === 1;
      }, "Expect queue drain to finish and be called", 2000);
      runs(function(){
        //check that everything ran correctly and do any other checks here
        //console.log("first call", agent.send.mostRecentCall.args);
        //make sure it sent an options with the correct email
        expect(mailers.mailUserTerms.mostRecentCall.args[0].email).toEqual(user4.email);
        expect(mailers.mailUserTerms).toHaveBeenCalled();
        //make sure something was sent to the actual transporter, at least that the email is correct
        expect(transporter.sendMail).toHaveBeenCalled();
        expect(transporter.sendMail.mostRecentCall.args[0].to).toEqual(user4.email);
        done();
      });
     // superagent
     // .post(domain + "/challenges/" + challenge1.id + '/submissions/' + submission2.id + '/remove')
     // .send({
     //   placeholder: 'empty holder'
     // })
     // .end(function(res){
     //   expect(res.status).toEqual(200);
     //   expect(mailers.mailUserTerms).toHaveBeenCalled();
     //   done();
     // });
    });
    it('should remove user4 from challenge1', function(done){
      //user 4 should no longer have any challenges
      superagent
      .get(domain + "/users/" + user4.id + '/challenges/page/1')
      .end(function(res){
        expect(res.status).toEqual(404);
        done();
      });
    });
    it('should still allow user1 to see challenge1', function(done){
      //other users should still see the challenge
      superagent
      .get(domain + "/users/" + user1.id + '/challenges/page/1')
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should still allow user2 to see challenge1', function(done){
      //other users should still see the challenge
      superagent
      .get(domain + "/users/" + user2.id + '/challenges/page/1')
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should still allow user3 to see challenge1', function(done){
      //other users should still see the challenge
      superagent
      .get(domain + "/users/" + user3.id + '/challenges/page/1')
      .end(function(res){
        expect(res.status).toEqual(200);
        done();
      });
    });
    it('should remove user4\'s inappropriate submission2 from challenge1', function(done){
      //submission with that ID should no longer exist
      Challenge
      .findOne({_id: challenge1.id})
      .exec(function(err, challenge){
        //only one submission should be left
        expect(challenge.submissions.length).toEqual(1);
        //the only one left should be submission1 as submission2 is gone
        expect(challenge.submissions[0].toString()).toEqual(submission1.id);
        done();
      });
    });
    it('should keep user1\'s comment from submission1 in challenge1', function(done){
      Submission
      .findOne({_id: submission1.id, 'comments.commenter': user1.id})
      .exec(function(err, submission){
        expect(err).toEqual(null);
        expect(submission).toBeDefined();
        expect(submission).not.toEqual(null);
        done();
      });
    });
    it('should keep user2\'s comment from submission1 in challenge1', function(done){
      Submission
      .findOne({_id: submission1.id, 'comments.commenter': user2.id})
      .exec(function(err, submission){
        expect(err).toEqual(null);
        expect(submission).toBeDefined();
        expect(submission).not.toEqual(null);
        done();
      });
    });
    it('should remove user4\'s comment from submission1 in challenge1', function(done){
      Submission
      .findOne({_id: submission1.id})
      .exec(function(err, submission){
        expect(err).toEqual(null);
        submission.comments.forEach(function(comment, index){
          //make sure the user ejected from challenge1 has no comments in the other submission for that challenge
          expect(comment.commenter.toString()).not.toEqual(user4.id);
        });
        done();
      });
    });
    it('should remove that submission from the recent activity of user4', function(done){
      expect(false).toEqual(true);
      done();
    });
    it('should remove the comment that user4 made in challenge1 from recent activity', function(done){
      expect(false).toEqual(true);
      done();
    });
    it('user4 should now have a strike against them that is they should be closer to being banned', function(done){
      expect(false).toEqual(true);
      done();
    });
  });
  describe('A Banned User', function(){
    it('should be banned on the final strike', function(done){
      expect(false).toEqual(true);
      done();
    });
    it('should have an email sent to them', function(done){
      expect(false).toEqual(true);
      done();
    });
    it('should have their password changed to a random password', function(done){
      expect(false).toEqual(true);
      done();
    });
    it('should remove the device ids of the user', function(done){
      //this prevents any notifications from being sent to the user system wide
      expect(false).toEqual(true);
      done();
    });
    it('should email the moderator letting them know which user was banned', function(done){
      //this prevents any notifications from being sent to the user system wide
      expect(false).toEqual(true);
      done();
    });
    it('should remove the email address of the user allowing them to sign up with it again', function(done){
      //this prevents any notifications from being sent to the user system wide
      expect(false).toEqual(true);
      done();
    });
  });
};

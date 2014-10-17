var transporter = require('../mail/transporter.js');
var logger = require('../logger/logger.js');
var async = require('async');
var config = require('../conf/config.js');

/**
  * @param options Info about the mail message to send
  * @param options.flaggedUser The name of the user being flagged.
  */
exports.moderateSubmission = function(options){
  var text = 'User:' + options.flaggedUserEmail + ' submission has been flagged';
  var html = '<p>User:' + options.flaggedUserEmail + ' submission has been flagged </p>'
    + "<a href='http://admin:admin@" + config.apiURL + "/api/v1/challenges/" + options.challengeId + "/submissions/" + options.submissionId + "/remove'> Remove Submission </a>"
    + "<br>"
    + "<a href='http://admin:admin@" + config.apiURL + "/api/v1/challenges/" + options.challengeId + "/submissions/" + options.submissionId + "/keep'> Keep Submission </a>"

  transporter.sendMail({
    from: 'moderate@quipics.com',
    to: 'sleepyfloydshaan@gmail.com',
    subject: 'Quipics Flagged Submission',
    html: html,
    attachments: [{
      filename: 'submission.png',
      content: options.image.data,
      encoding: 'base64'
    }]
  }, function(err){
    if (!err){
      logger.info('Email sent for to moderator flagged submission');
      //return cb(null);
    } else {
      logger.error('Error: Could not send moderator flagged submission email');
      //return cb({clientMsg: "Could not send flagged submission email"});
    }
  });
};

exports.mailBannedUser = function(options){
  var text = 'You have been banned for violating the TOS. Email us if you feel this was in error';
  var email = options.email;
  //send email to banned user
  logger.info("Start to email user and moderator regarding banned status");
  transporter.sendMail({
    from: 'moderate@quipics.com',
    to: options.email,
    subject: 'Quipics Banned User Information',
    text: text
  }, function(err){
    if (!err){
      logger.info('Banned Email sent to user for being banned');
      //return cb(null);
    } else {
      logger.error('Error: Could not send banned email to user for being banned err:', {options: options, err: err, stack: new Error().stack});
      //return cb({clientMsg: "Could not send flagged submission email"});
    }
  });
  //send email to moderator regarding banned user
  var bannedSubject = 'User with email: ' + email;
  transporter.sendMail({
    from: 'moderate@quipics.com',
    to: 'sleepyfloydshaan@gmail.com',
    subject: bannedSubject,
    text: 'User in subject was banned'
  }, function(err){
    if (!err){
      logger.info('Banned email sent to moderator for their info');
    } else {
      logger.error('Error: Couldnt not send banned email to moderator, err:', {err: err, stack: new Error().stack});
    }
  });

};
exports.mailUserTerms = function(options){
  var text = "Your submission has been removed because it has violated the Quipic's TOS";
  var email = options.email;
  transporter.sendMail({
    from: 'moderate@quipics.com',
    to: options.email,
    subject: 'Quipics Terms of Service',
    text: text
  }, function(err){
    if (!err){
      logger.info('TOS Email sent to user for flagged submission');
      //return cb(null);
    } else {
      logger.error('Error: Could not send TOS to user for flagged submission');
      //return cb({clientMsg: "Could not send flagged submission email"});
    }
  });

};

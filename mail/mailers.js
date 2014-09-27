var transporter = require('../mail/transporter.js');
var logger = require('../logger/logger.js');

/**
  * @param options Info about the mail message to send
  * @param options.flaggedUser The name of the user being flagged.
  */
exports.moderateSubmission = function(options){
  var text = 'User:' + options.flaggedUser + ' submission has been flagged';
  transporter.sendMail({
    from: 'moderate@quipics.com',
    to: 'sleepyfloydshaan@gmail.com',
    subject: 'Quipics Flagged Submission',
    text: text,
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
  var text = 'User Banned Info Here';
  var email = options.email;
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
      logger.error('Error: Could not send banned email to user for being banned');
      //return cb({clientMsg: "Could not send flagged submission email"});
    }
  });

};
exports.mailUserTerms = function(options){
  var text = 'User TOS Here';
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

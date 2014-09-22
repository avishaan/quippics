var transporter = require('transporter.js');
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
    text: text
  }, function(err){
    if (!err){
      logger.info('Email send regarding flagged submission');
      //return cb(null);
    } else {
      logger.error('Error: Could not send flagged submission email');
      //return cb({clientMsg: "Could not send flagged submission email"});
    }
  });

};

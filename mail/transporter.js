var nodemailer = require('nodemailer');
var transporter = module.exports = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'quipicsreset@codehatcher.com', 
    pass: 'badmin123'
  }
});

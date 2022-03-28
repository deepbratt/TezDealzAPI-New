const nodemailer = require('nodemailer');
const smtpEndpoint = process.env.AWS_SES_SMTP_ENDPOINT;
// The port to use when connecting to the SMTP server.
const port = process.env.AWS_SES_PORT;
const senderAddress = process.env.AWS_SES_SENDER_ADDRESS;
const smtpUsername = process.env.AWS_SES_SMTP_USERNAME;
const smtpPassword = process.env.AWS_SES_SMTP_PASSWORD;

module.exports = class Email {
  constructor(user, token) {
    this.to = 'no-reply@carokta.com';
    this.firstName = user.firstName;
    this.token = token;
    this.from = `CarOkta <${senderAddress}>`;
  }
  newTransport() {
    // Create the SMTP transport.
    return nodemailer.createTransport({
      host: smtpEndpoint,
      port: port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });
  }

  async send(subject) {
    // mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: `Your Password Reset token is:  ${this.token}`,
    };
    //create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordResetToken() {
    await this.send('Your Password Reset Token(only valid for 10 minutes)');
  }
};

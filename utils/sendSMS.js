const twilio = require('twilio');

const sendSMS = async (options) => {
  const accountSid = process.env.ACCOUNT_SID_TWILIO; // Your Account SID from www.twilio.com/console
  const authToken = process.env.AUTH_TOKEN_TWILIO; // Your Auth Token from www.twilio.com/console
  const client = new twilio(accountSid, authToken);

  await client.messages.create({
    body: options.body,
    to: options.phone, // Text this number
    from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
  });
};

module.exports = sendSMS;

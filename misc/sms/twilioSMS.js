// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
import twilio from 'twilio';
import config from 'config';
import winston from 'winston';

const accountSid = config.get(process.env.NODE_ENV === 'production' ? 'sms.twilioSID' : 'sms.twilioSIDTest');
const apiKey = config.get(process.env.NODE_ENV === 'production' ? 'sms.twilioApiKey' : 'sms.twilioApiKeyTest');
const sender = config.get('sms.twilioSender');
const apiSecret = config.get(process.env.NODE_ENV === 'production' ? 'sms.twilioApiSecret' : 'sms.twilioApiSecretTest');
const client = twilio(apiKey, apiSecret, { accountSid });

/**
 * @param {string} message
 * @param {string} mobile - mobile number in international format +201234567890
 * @returns - { Success: true }  in case message sent successfully
 *          - { Success: false } in case of failure
 */
const TwilioSMS = async (message, mobile) => {
    try {
        await client.messages
            .create({
                body: message,
                from: sender,
                to: mobile,
            });
        return { Success: true };
    } catch (error) {
        winston.error(`Failed to send SMS using Twilio Service ${error}`);
        return { Success: false };
    }
};

export default TwilioSMS;

/**
 * TERMI SMS SERVICE
 * @module
 * not used
 */
import axios from 'axios';
import config from 'config';
import winston from 'winston';

/**
 * - not used now but may be used later to send whatsapp messages
 * @param {string} msg
 * @param {string} mobile - in international format +201234567890
 * @param {'dnd'|'whatsapp'|'generic'} channel
 * @returns
 */
const TermiSMS = async (msg, mobile, channel) => {
    try {
        const data = {
            to: mobile,
            from: config.get('sms.sender'), // Sender ID to change this it must be approved first from service providers
            sms: msg,
            type: 'plain',
            api_key: config.get('sms.termiiApiKey'),
            channel,
        };
        const url = 'https://termii.com/api/sms/send';
        const options = {
            headers: { 'Content-Type': ['application/json', 'application/json'] },
        };
        const response = await axios.post(url, data, options);
        if (response.data.code !== 'ok') {
            winston.error(`Failed to send sms to ${mobile} using Termi. Message: ${msg}`);
        }

        return { Success: true };
    } catch (error) {
        winston.error(`Failed to send SMS using Termi Service ${error}`);
        return { Success: false };
    }
};

export default TermiSMS;

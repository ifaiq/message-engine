/**
 * WE SMS SERVICE
 * @module
 */
import axios from 'axios';
import config from 'config';
import winston from 'winston';

const WECode = `${config.get('sms.weApiUserName')}:${config.get('sms.weApiPassword')}:${config.get('sms.weAccountId')}`;
const WESecret = Buffer.from(WECode).toString('base64');

/**
 * @param {string} msg
 * @param {string} mobile - mobile number in international format +201234567890
 * @returns - { Success: true }  in case message sent successfully
 *          - { Success: false } in case of failure
 */
const WESMS = async (msg, mobile) => {
    try {
        const newArr = [{ msisdn: mobile.slice(1) }];
        const data = {
            account_id: config.get('sms.weAccountId'),
            sender: config.get('sms.weSender'),
            text: msg,
            mobile_list: newArr,
        };

        const options = {
            method: 'post',
            url: 'http://weapi.connekio.com/sms/batch',
            headers: {
                Authorization: `Basic ${WESecret}`,
                'Content-Type': 'application/json',
            },
            data,
        };
        const response = await axios(options);
        if (response.status === 200) return { Success: true };
        winston.error(`Failed to send sms to ${mobile} using WE. Message: ${msg}`);
        return { Success: false };
    } catch (error) {
        winston.error(`Failed to send SMS using WE Service ${error}`);
        return { Success: false };
    }
};

export default WESMS;

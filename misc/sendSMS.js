/**
 * Send SMS misc
 * @module
 */

import winston from 'winston';
import validatePhoneNumber from './validatePhoneNumber.js';
import {
    AWSSMS, TwilioSMS, WESMS,
} from './sms/index.js';

/**
 * @param {string[]} mobilesArr - array of mobile numbers:
 *                              - in international format +201023456789
 *                              - or in one of the valid egyptian numbers formats
 *                                201023456789 | 00201023456789 | 0201023456789 | 201023456789
 * @returns array of mobile numbers in international format ex: +201023456789
 */
const validateMobileNumbers = (mobilesArr) => {
    const mobileArr = [];
    for (let i = 0; i < mobilesArr.length; i += 1) {
        const { isValid, phoneNumber } = validatePhoneNumber(mobilesArr[i]);
        if (isValid) mobileArr.push(phoneNumber);
    }
    return mobileArr;
};

/**
 *
 * @param {string} msg - message to be sent
 * @param {string[]} mobile    - array of mobile numbers:
 *                          - in international format +201023456789
 *                          - or in one of the valid egyptian numbers formats
 *                            201023456789 | 00201023456789 | 0201023456789 | 201023456789
 * @param {'primary'|'secondary'} service
 * @returns - {success: true} in case of all messages sent successfully
 *          - {success: false} in case of failure of one or more messages
 *
 */
const sendSMS = async (msg, mobile, service = 'primary') => {
    const mobileArr = validateMobileNumbers(mobile);
    try {
        let Success;
        let resArr = [];
        for (let i = 0; i < mobileArr.length; i += 1) {
            if (service === 'primary') {
                if (mobileArr[i].startsWith('+20')) {
                    ({ Success } = await WESMS(msg, mobileArr[i]));
                    resArr = [...resArr, Success];
                } else {
                    ({ Success } = await TwilioSMS(msg, mobileArr[i]));
                    resArr = [...resArr, Success];
                }
            } else if (mobileArr[i].startsWith('+20')) {
                ({ Success } = await TwilioSMS(msg, mobileArr[i]));
                resArr = [...resArr, Success];
            } else {
                ({ Success } = await AWSSMS(msg, mobileArr[i]));
                resArr = [...resArr, Success];
            }
        }
        return { Success: !resArr.includes(false) };
    } catch (e) {
        winston.error(`Something went wrong with service ${service} to send sms to ${mobile} , err: ${e}`);
        return { Success: false };
    }
};

export default sendSMS;

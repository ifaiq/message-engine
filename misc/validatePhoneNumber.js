import winston from 'winston';
import isValidPhoneNumber from '../models/utils/isValidPhoneNumber.js';

/**
 * @param {string} phoneNumber - mobile number:
 *                             - in international format +201234567890
 *                             - or in one of the valid egyptian numbers formats
 *                               201234567890 | 00201234567890 | 0201234567890 | 201234567890
 * @returns - isValid : true if phone number is in valid format
 *          - phoneNumber : the number in international format +201234567890
 */
function validatePhoneNumber(phoneNumber) {
    if (isValidPhoneNumber(phoneNumber)) {
        return { isValid: true, phoneNumber };
    } if (/^01[0-2|5]{1}[0-9]{8}$/.test(phoneNumber)) {
        return { isValid: true, phoneNumber: `+2${phoneNumber}` };
    } if (/^(201)[0-2|5]{1}[0-9]{8}$/.test(phoneNumber)) {
        return { isValid: true, phoneNumber: `+${phoneNumber}` };
    } if (/^(0201)[0-2|5]{1}[0-9]{8}$/.test(phoneNumber)) {
        return { isValid: true, phoneNumber: `+${phoneNumber.slice(1)}` };
    } if (/^(00201)[0-2|5]{1}[0-9]{8}$/.test(phoneNumber)) {
        return { isValid: true, phoneNumber: `+${phoneNumber.slice(2)}` };
    }
    winston.error(`invalid phone number ${phoneNumber}`);
    return { isValid: false, phoneNumber };
}

export default validatePhoneNumber;

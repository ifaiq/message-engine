import libPhoneNumber from 'google-libphonenumber';

/**
 * checks that phoneNumber is in international format and a valid number
 * @param {string} phoneNumber - in international format +201234567890
 * @returns - true if number is valid , false if number is empty or not in valid format
 */
function isValidPhoneNumber(phoneNumber) {
    const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
    const { PhoneNumberType } = libPhoneNumber;
    try {
        // parse phone number to country code and number
        const number = phoneUtil.parseAndKeepRawInput(phoneNumber);
        return phoneUtil.isValidNumber(number) && (phoneUtil.getNumberType(number) === PhoneNumberType.MOBILE || phoneUtil.getNumberType(number) === PhoneNumberType.FIXED_LINE_OR_MOBILE);
    } catch {
        return false;
    }
}

export default isValidPhoneNumber;

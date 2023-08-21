/**
* AWS misc
* @module
*/
// Load the AWS SDK for Node.js
import AWS from 'aws-sdk';
import moment from 'moment';
import winston from 'winston';

// Set region
AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });

/**
 * @param {string} message
 * @param {string} mobile - mobile number in international format +201234567890
 * @returns - { Success: true }  in case message sent successfully
 *          - { Success: false } in case of failure
 */
const AWSSMS = async (message, mobile) => {
    try {
        const params = {
            Message: message,
            PhoneNumber: mobile,
        };
        const attributes = {
            attributes: { /* required */
                DefaultSMSType: 'Promotional', /* Default reliability */
            },
        };
        const SNS = new AWS.SNS({ apiVersion: moment().format('YYYY-MM-DD') });
        const setMessageAttribute = SNS.setSMSAttributes(attributes).promise();
        await setMessageAttribute;
        // Create promise and SNS service object
        const publishTextPromise = SNS.publish(params).promise();
        await publishTextPromise;
        winston.debug(`SMS sent Successfully to ${params.PhoneNumber} using AWS. Message: ${params.Message}`);
        return { Success: true };
    } catch (error) {
        winston.error(`Something went wrong with service AWS SMS, err: ${error}`);
        return { Success: false };
    }
};
export default AWSSMS;

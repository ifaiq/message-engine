/**
* Contact Us Notifications
* @module
*/

import winston from 'winston';
import config from 'config';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendEmail from '../misc/sendEmail.js';
import ContactUs from '../models/contactUs.js';

const bccEmailAddress = config.get('bcc_email_address');

async function notifyContactUsResponse(contactUsId, brandName, languageParam) {
    try {
        const contactUs = await ContactUs.findById(contactUsId).select('name email subject response').lean();
        if (isEmpty(contactUs)) {
            const error = new Error(`contactUs with ID <${contactUsId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (isEmpty(contactUs.name) || isEmpty(contactUs.email) || isEmpty(contactUs.subject) || isEmpty(contactUs.response)) {
            const error = new Error(`contactUs with ID <${contactUsId}> has missing data`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const language = (languageParam === 'en' || languageParam === 'ar') ? languageParam : 'en';

        // contact us email can be not a user so sendNotification method can not be called as it takes user id
        await sendEmail(
            { to: contactUs.email, bcc: bccEmailAddress },
            messages[language].contactUs.contactUsMailSubject(brandName),
            messages[language].contactUs.contactUsMailBody(contactUs.name, contactUs.subject, contactUs.response),
            language,
        );
        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

export default notifyContactUsResponse;

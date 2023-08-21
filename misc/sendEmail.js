/**
* Send Email misc
* @module
*/

import config from 'config';
import sgMail from '@sendgrid/mail';

const mazadatSimpleEnTemplateId = config.get('mail.mazadatSimpleEnTemplateId');
const mazadatSimpleArTemplateId = config.get('mail.mazadatSimpleArTemplateId');

/**
 * - This is the main function for sending emails.
    - A transport is created once.
    - In mailOptions:
        "from": can be changed in case the service used is not outlook. In case the service is gmail, only the sender
        name can be changed, but the email will be the same as the email that was given to the transporter.
        "to", "subject", and "text" will be the ones that are passed to the function as parameters.
    - Finally the mail is sent using transporter.sendMail {@link sgMail} given the mailOptions specified above.

 * @param {object} toObj - object of the email recipients
 * @param {string[]} toObj.to
 * @param {string} [toObj.cc]
 * @param {string} [toObj.bcc]
 * @param {string} subject
 * @param {string} text - the body of the email
 * @param {'en'|'ar'} [language = 'en']
 * @returns returns the output of {@link sgMail.sendMultiple}
 */
const sendEmail = async (toObj, subject, text, language = 'en') => {
    sgMail.setApiKey(config.get('mail.sendGridApiKey'));

    const templates = {
        mazadat_simple_en: mazadatSimpleEnTemplateId,
        mazadat_simple_ar: mazadatSimpleArTemplateId,
    };

    let cc;
    let to;
    let bcc;
    if (typeof toObj === 'object' && !Array.isArray(toObj)) {
        cc = toObj.cc;
        to = toObj.to;
        bcc = toObj.bcc;
    } else {
        to = toObj;
    }
    const emailAddress = config.get('email_address');
    const brandName = config.get('brandName');
    const mailOptions = {
        from: `${brandName} <${emailAddress}>`,
        to,
        cc,
        bcc,
        templateId: language === 'en' ? templates.mazadat_simple_en : templates.mazadat_simple_ar,
        dynamic_template_data: {
            subject,
            message: text.replace(/\n/g, '<br>'),
        },
        hideWarnings: true,
    };

    // sendMultiple to prevent users from seeing each others
    const results = await sgMail.sendMultiple(mailOptions);

    return results;
};

export default sendEmail;

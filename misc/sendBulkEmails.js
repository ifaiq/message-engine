/**
 * Send Bulk Emails misc
 * @module
 */

import winston from 'winston';
import sendNotifications from './notifications.js';

//------------------------------------------------------------------------
/**
 * Send the same email (English and Arabic) to lots of users.
 *
 * @param {User[]}  users       The users to be notified.
 * @param {Object}  subject     The subject of the email.
 * @param {String}  subject.en  The English subject.
 * @param {String}  subject.ar  The Arabic subject.
 * @param {Object}  message     The message of the email.
 * @param {String}  message.en  The English message.
 * @param {String}  message.ar  The Arabic message.
 * @param {String}  notificationTypeName The notification type name.
 *
 * @returns {Object} {sent: Boolean, err?:Error}
 */
async function sendBulkEmails(users, subject, message, notificationTypeName) {
    const notificationMeans = { isEmail: true };
    let enUsers = [];
    let arUsers = [];
    const maxRecepientsPerAPIRequest = 1000;
    for (let i = 0, j = maxRecepientsPerAPIRequest, k = maxRecepientsPerAPIRequest; i < users.length; i += 1) {
        try {
            const user = users[i];
            if (user.language === 'en') {
                enUsers.push(user._id);
                j -= 1;
            } else if (user.language === 'ar') {
                arUsers.push(user._id);
                k -= 1;
            } else {
                const error = new Error(`Undefined language <${user.language}> for user with ID <${user._id}>`);
                winston.error(error);
            }

            if (j === 0 || i === users.length - 1) {
                if (enUsers.length > 0) {
                    const params = { email: { subject: subject.en, text: message.en, language: 'en' } };
                    const { sent, err } = await sendNotifications(notificationMeans, params, enUsers, notificationTypeName);
                    if (!sent) winston.error(err);
                    enUsers = [];
                }
                j = maxRecepientsPerAPIRequest;
            }

            if (k === 0 || i === users.length - 1) {
                if (arUsers.length > 0) {
                    const params = { email: { subject: subject.ar, text: message.ar, language: 'ar' } };
                    const { sent, err } = await sendNotifications(notificationMeans, params, arUsers, notificationTypeName);
                    if (!sent) winston.error(err);
                    arUsers = [];
                }
                k = maxRecepientsPerAPIRequest;
            }
        } catch (error) {
            return { sent: false, err: error };
        }
    }

    return { sent: true };
}

export default sendBulkEmails;

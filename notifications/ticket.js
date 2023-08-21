/**
* Ticket Notifications
* @module
*/

import config from 'config';
import winston from 'winston';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import User from '../models/user.js';

const bccEmailAddress = config.get('bcc_email_address');

async function notifyTicketReply(email, subject, reply, language) {
    const user = await User.findOne({ 'email.address': email }).select('_id').lean();
    if (isEmpty(user)) {
        const error = new Error(`User with email <${email}> not found to send ticket reply to.`);
        winston.error(error);
        return { sent: false, err: error };
    }
    const notificationMeans = { isEmail: true };
    const params = {
        email: {
            extraRecipients: { bcc: bccEmailAddress },
            subject,
            text: reply,
            language,
        },
    };
    const isNotificationSent = await sendNotifications(notificationMeans, params, [user._id], 'GeneralMandatory');
    return isNotificationSent;
}

export default notifyTicketReply;

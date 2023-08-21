/**
* Email Verification Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import sendNotifications from '../misc/notifications.js';
import User from '../models/user.js';

async function notifyUserEmailNotVerified() {
    const users = await User.find({ 'email.isVerified': false, 'banning.isBanned': false }, 'language').lean();

    const userIds = [];
    const pushMessages = [];
    const payloads = [];
    for (let i = 0; i < users.length; i += 1) {
        const user = users[i];
        try {
            userIds.push(user._id);
            const payloadObj = {
                read: false,
                user: user._id,
                type: 'userProfile',
            };
            payloads.push(payloadObj);
            pushMessages.push({
                title: messages[user.language].emailVerification.verifyEmailPushSubject,
                body: messages[user.language].emailVerification.verifyEmailPushBody,
            });
        } catch (error) {
            winston.error(`Something went wrong when creating the email verification payload for user <${users[i]._id}>`);
        }
    }

    const notificationMeans = { isPush: true };
    const params = { push: { messages: pushMessages, payloads } };

    const isNotificationSent = await sendNotifications(notificationMeans, params, userIds, 'UserAccount');
    return isNotificationSent;
}
export default notifyUserEmailNotVerified;

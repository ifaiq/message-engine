/**
* Shareable Link Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import User from '../models/user.js';

async function notifyUserLinkRegenerated(userId) {
    try {
        const user = await User.findById(userId).select('language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            user: user._id,
            type: 'shareableLink',
        };

        const pushSubject = messages[user.language].shareableLink.regeneratedPushSubject;
        const pushBody = messages[user.language].shareableLink.regeneratedPushBody;
        const pushMessageObj = { title: pushSubject, body: pushBody };

        const notificationMeans = { isPush: true };
        const params = { push: { messages: [pushMessageObj], payloads: [payloadObj] } };

        return await sendNotifications(notificationMeans, params, [userId], 'MyMazadatCommunity');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyUserLinkExtended(userId) {
    try {
        const user = await User.findById(userId).select('language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            user: user._id,
            type: 'shareableLink',
        };

        const pushBody = messages[user.language].shareableLink.extendedPushBody;
        const pushSubject = messages[user.language].shareableLink.extendedPushSubject;
        const pushMessageObj = { title: pushSubject, body: pushBody };

        const notificationMeans = { isPush: true };
        const params = { push: { messages: [pushMessageObj], payloads: [payloadObj] } };

        return await sendNotifications(notificationMeans, params, [userId], 'MyMazadatCommunity');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyUserLinkRegenerated,
    notifyUserLinkExtended,
};

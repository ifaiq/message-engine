/**
 * Action Notifications
 * @module
 */

import winston from 'winston';

import ActionTodoList from '../models/ActionsTodoList.js';
import User from '../models/user.js';

import sendNotifications from '../misc/notifications.js';
import isEmpty from '../misc/isEmpty.js';

import messages from '../i18n/i18n.js';

async function notifyUserPendingActions(actionId, link, fromRequestFlag) {
    try {
        const action = await ActionTodoList.findById(actionId).select('_id seen status user').lean();
        if (isEmpty(action)) {
            winston.debug('action not found');
            const error = new Error('action not found');
            return { sent: false, err: error };
        }
        if (!link) {
            const error = new Error('Not a valid link');
            return { sent: false, err: error };
        }
        const userId = action.user;
        if ((action.seen || action.status !== 'unread') && !fromRequestFlag) {
            winston.debug('action is already seen');
            const error = new Error('Action is already seen by the user');
            return { sent: false, err: error };
        }
        const user = await User.findById(userId).select('_id language username').lean();
        if (isEmpty(user)) {
            winston.debug('user not found');
            const error = new Error('user not found');
            return { sent: false, err: error };
        }
        const pushTitle = messages[user.language].action.pendingActionsTitle;
        const pushBody = messages[user.language].action.pendingActionsPushBody;
        const smsBody = messages[user.language].action.pendingActionsSmsBody(user.username, link);
        const notificationMeans = fromRequestFlag ? { isPush: true } : { isPush: true, isSMS: true };
        const payloadObj = {
            read: false,
            user: userId,
            type: 'action',
            action: actionId,
        };
        const params = {
            push: {
                messages: [{ title: pushTitle, body: pushBody }],
                payloads: [payloadObj],
            },
            sms: {
                message: smsBody,
                service: 'primary',
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export default notifyUserPendingActions;

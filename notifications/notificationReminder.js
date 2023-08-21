/**
 * Notifications Reminder
 * @module
 */

import Notification from '../models/notification.js';

import sendNotifications from '../misc/notifications.js';
import isEmpty from '../misc/isEmpty.js';
/**
 * Send the same notification after delay 10 mins with the same routing and same content
 * @param {String} notificationId Notification ID
 * @returns status and err
 */
async function sendNotificationReminder(notificationId) {
    try {
        const notification = await Notification.findById(notificationId).select([
            '-createdAt',
            '-updatedAt',
            '-_id',
            '-read',
            '-deleted',
            '-seen',
        ]).lean();
        if (isEmpty(notification)) {
            const error = new Error(`Notification with ID <${notificationId}> not found`);
            return { sent: false, err: error };
        }
        const { title, body, user } = notification;
        const payloadObj = {
            read: false,
            ...notification,
        };
        const means = { isPush: true };
        const params = {
            push: {
                messages: [{ title, body }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(means, params, [user], 'MyAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}
export default sendNotificationReminder;

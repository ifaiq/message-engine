import mongoose from 'mongoose';
import winston from 'winston';
import isEmpty from '../misc/isEmpty.js';
import User from '../models/user.js';
import sendNotifications from '../misc/notifications.js';
import messages from '../i18n/i18n.js';
import Post from '../models/post.js';

/**
 * @description A functions getting triggered to send important reminders for users who have important action that they should be notified with.
 * @param {string} userId the user whom we want to notify,
 * @param {string} notificationName,
 * @param {'approvedPostReminder' | 'completedPurchases' | 'startedBiddings' } topic
*/
//------------------------------------------------------------------------
async function notifyImportantActivity(userId, notificationName, topic) {
    try {
        const user = await User.findById(userId).lean();
        const notificationMeans = { isSMS: true };
        let sms = {};

        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userObjectId = mongoose.Types.ObjectId(userId);

        if (topic === 'approvedPostReminder') {
            const userPost = await Post
                .find({ seller: userObjectId })
                .sort({ createdAt: -1 })
                .select('title')
                .lean();
            sms = {
                message: messages[user.language].reminders[topic](userPost?.title),
            };
        } else {
            sms = {
                message: messages[user.language].reminders[topic],
            };
        }

        return sendNotifications(notificationMeans, { sms }, [userId], notificationName, false, true);
    } catch (error) {
        return { sent: false, err: error };
    }
}

export default notifyImportantActivity;

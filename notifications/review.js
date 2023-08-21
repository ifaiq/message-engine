/**
* Review Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Review from '../models/review.js';
import User from '../models/user.js';

async function notifyUserReviewDisapproved(reviewId) {
    try {
        const review = await Review.findById(reviewId).select('reviewer text').lean();
        if (isEmpty(review)) {
            const error = new Error(`Review with ID <${reviewId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = review.reviewer;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[user.language].review.reviewRejectedMailSubject,
                text: messages[user.language].review.reviewRejectedMailBody(user.username, review.text),
                language: user.language,
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'MyMazadatCommunity');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export default notifyUserReviewDisapproved;

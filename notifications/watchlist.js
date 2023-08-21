/**
* Watchlist Notifications
* @module
*/

import winston from 'winston';
import config from 'config';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Post from '../models/post.js';
import User from '../models/user.js';

const storageHost = config.get('storage_host');
const thumbnailsContainerName = config.get('post.thumbnailsContainerName');
const storageLink = `${storageHost}${thumbnailsContainerName}/`;

async function notifyUsersWatchlistPostRunningOut(postId) {
    const post = await Post.findById(postId).select('status title thumbnail').lean();
    if (isEmpty(post) || post.status !== 'available') {
        winston.debug(`Post with ID <${postId}> not found or already ran out`);
        return { sent: true };
    }

    const users = await User.find({ 'banning.isBanned': false, watchList: postId }).select('language').lean();

    const userIds = [];
    const pushMessages = [];
    const payloads = [];
    for (let i = 0; i < users.length; i += 1) {
        const userId = users[i]._id;
        try {
            userIds.push(userId);
            const payloadObj = {
                read: false,
                user: userId,
                userType: 'buyer',
                type: 'watchlist',
                post: postId,
            };
            payloads.push(payloadObj);

            const pushSubject = messages[users[i].language].watchlist.postExpiringOrQuantityRunningOutPushSubject;
            const pushBody = messages[users[i].language].watchlist.postExpiringOrQuantityRunningOutPushBody(post.title);

            pushMessages.push({
                title: pushSubject,
                body: pushBody,
                image: `${storageLink}${post.thumbnail}`,
            });
        } catch (error) {
            winston.error(`Something went wrong when creating the watchlist post running out payload for user <${userId}>`);
        }
    }

    const notificationMeans = { isPush: true };
    const params = { push: { messages: pushMessages, payloads } };

    const isNotificationSent = await sendNotifications(notificationMeans, params, userIds, 'MyItemsOfInterest');
    return isNotificationSent;
}

async function notifyUsersWatchlistPostDiscounted(postId) {
    const post = await Post.findById(postId).select('status title discount.discount_percentage thumbnail').lean();
    if (isEmpty(post) || post.status !== 'available') {
        winston.debug(`Post with ID <${postId}> not found or already ran out`);
        return { sent: true };
    }
    if (!post.discount || !post.discount.discount_percentage || post.discount.discount_percentage <= 0) {
        winston.debug(`Post with ID <${postId}> contains no discount`);
        return { sent: true };
    }

    const users = await User.find({ 'banning.isBanned': false, watchList: postId }).select('language').lean();

    const userIds = [];
    const pushMessages = [];
    const payloads = [];
    for (let i = 0; i < users.length; i += 1) {
        const userId = users[i]._id;
        try {
            userIds.push(userId);
            const payload = {
                read: false,
                user: userId,
                userType: 'buyer',
                type: 'watchlist',
                post: postId,
            };
            payloads.push(payload);

            const pushSubject = messages[users[i].language].watchlist.postDiscountedPushSubject;
            const pushBody = messages[users[i].language].watchlist.postDiscountedPushBody(post.title, Math.round(post.discount.discount_percentage * 10) / 10);

            pushMessages.push({
                title: pushSubject,
                body: pushBody,
                image: `${storageLink}${post.thumbnail}`,
            });
        } catch (error) {
            winston.error(`Something went wrong when creating the watchlist post started discounted for user <${userId}>`);
        }
    }

    const notificationMeans = { isPush: true };
    const params = { push: { messages: pushMessages, payloads } };

    const isNotificationSent = await sendNotifications(notificationMeans, params, userIds, 'MyItemsOfInterest');
    return isNotificationSent;
}

async function notifyUserWatchlistPostReposted(userId, oldId, newId) {
    try {
        const oldPost = await Post.findById(oldId).select('esId title').lean();
        if (isEmpty(oldPost)) {
            const error = new Error(`Old post with ID <${oldId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const newPost = await Post.findById(newId).select('esId status thumbnail').lean();
        if (isEmpty(newPost)) {
            const error = new Error(`New post with ID <${newId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const user = await User.findById(userId).select('language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            user: userId,
            userType: 'buyer',
            type: 'watchlist',
            post: newId,
        };

        const pushSubject = messages[user.language].watchlist.postRepostedPushSubject;
        const pushBody = messages[user.language].watchlist.postRepostedPushBody(oldPost.title);

        const notificationMeans = { isPush: true };
        const pushMessage = {
            title: pushSubject,
            body: pushBody,
            image: `${storageLink}${newPost.thumbnail}`,
        };
        const params = {
            push: {
                messages: [pushMessage],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyItemsOfInterest');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyUsersWatchlistPostRunningOut,
    notifyUsersWatchlistPostDiscounted,
    notifyUserWatchlistPostReposted,
};

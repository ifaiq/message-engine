/**
 * Engagement Notifications
 * @module engagementNotifications
 */

import config from 'config';
import winston from 'winston';

import isEmpty from '../misc/isEmpty.js';
import sendBulkEmails from '../misc/sendBulkEmails.js';
import sendNotifications from '../misc/notifications.js';

import getInterestedUsers from '../services/engagement/interestedUsers.js';
import getSimilarPosts from '../services/engagement/similarPosts.js';
import searchUsers from '../services/engagement/searchUsers.js';

import Order from '../models/order.js';
import Post from '../models/post.js';
import User from '../models/user.js';

const storageHost = config.get('storage_host');
const thumbnailsContainerName = config.get('post.thumbnailsContainerName');
const storageLink = `${storageHost}${thumbnailsContainerName}/`;
const notificationsContainerURL = `${config.get('storage_host')}${config.get('notificationsContainer')}/`;

//------------------------------------------------------------------------
/**
 * Notify users with generic push notification
 *
 * @param {Array.<{_id:mongoose.Types.ObjectId, language:String}>} users users to be notified.
 * @param {Boolean}   isEmail           Indicates whether to send an email.
 * @param {Object}    [emailSubject]    The email subject, mandatory if isEmail=true.
 * @param {String}    [emailSubject.en] The email English subject.
 * @param {String}    [emailSubject.ar] The email Arabic subject.
 * @param {Object}    [emailMessage]    The email message, mandatory if isEmail=true.
 * @param {String}    [emailMessage.en] The email English message.
 * @param {String}    [emailMessage.ar] The email Arabic message.
 * @param {Boolean}   isPush            Indicates whether to send a push message.
 * @param {Object}    [pushTitle]       The push message title, mandatory if isPush=true.
 * @param {String}    [pushTitle.en]    The push message English title.
 * @param {String}    [pushTitle.ar]    The push message Arabic title.
 * @param {Object}    [pushBody]        The push message body, mandatory if isPush=true.
 * @param {String}    [pushBody.en]     The push message English body.
 * @param {String}    [pushBody.ar]     The push message Arabic body.
 * @param {Boolean}   isSMS             Indicates whether to send an SMS.
 * @param {Object}    [smsMessage]      The sms message, mandatory if isSMS=true.
 * @param {String}    [smsMessage.en]   The sms English message.
 * @param {String}    [smsMessage.ar]   The sms Arabic message.
 * @param {'primary','secondary'}   [smsService=primary]  The service to be user in sending the sms, mandatory if isSMS=true.
 *
 * @returns {Object} {sent: Boolean, err?:Error}
 */
async function notifyUsersWithGenericPush(
    users, isEmail, emailSubject, emailMessage, isPush, pushTitle, pushBody,
    pushImage, isSMS, smsMessage, smsService = 'primary', notificationType,
) {
    // Email is special because there's a limit for the number of emails to be sent.
    if (isEmail) {
        const { sent, err } = await sendBulkEmails(users, emailSubject, emailMessage, notificationType);
        if (!sent) winston.error(err);
    }

    if (isPush || isSMS) {
        const userIdsEn = [];
        const userIdsAr = [];
        const payloadsEn = [];
        const payloadsAr = [];
        const pushMessagesEn = [];
        const pushMessagesAr = [];
        for (let i = 0; i < users.length; i += 1) {
            const user = users[i];
            if (user != null) {
                let payloadObj;
                let pushMessageEn;
                let pushMessageAr;
                if (isPush) {
                    pushMessageEn = {
                        title: pushTitle.en,
                        body: pushBody.en,
                    };
                    pushMessageAr = {
                        title: pushTitle.ar,
                        body: pushBody.ar,
                    };
                    payloadObj = {
                        read: false,
                        user: user._id,
                        type: 'generic',
                        image: pushImage ? `${notificationsContainerURL}${pushImage}` : undefined,
                    };
                }
                if (user.language === 'en') {
                    userIdsEn.push(user._id);
                    if (isPush) {
                        payloadsEn.push(payloadObj);
                        pushMessagesEn.push(pushMessageEn);
                    }
                } else if (user.language === 'ar') {
                    userIdsAr.push(user._id);
                    if (isPush) {
                        payloadsAr.push(payloadObj);
                        pushMessagesAr.push(pushMessageAr);
                    }
                } else {
                    const error = new Error(`Undefined language <${user.language}> for user with ID <${user._id}>`);
                    winston.error(error);
                }
            }
        }

        const notificationMeans = { isSMS, isPush };
        const paramsEn = {};
        const paramsAr = {};
        if (isPush) {
            paramsEn.push = {
                messages: pushMessagesEn,
                payloads: payloadsEn,
            };
            paramsAr.push = {
                messages: pushMessagesAr,
                payloads: payloadsAr,
            };
        }
        if (isSMS) {
            paramsEn.sms = {
                message: smsMessage.en,
                smsService,
            };
            paramsAr.sms = {
                message: smsMessage.ar,
                smsService,
            };
        }

        if (!isEmpty(userIdsEn)) {
            const { sent, err } = await sendNotifications(notificationMeans, paramsEn, userIdsEn, notificationType);
            if (!sent) winston.error(err);
        }
        if (!isEmpty(userIdsAr)) {
            const { sent, err } = await sendNotifications(notificationMeans, paramsAr, userIdsAr, notificationType);
            if (!sent) winston.error(err);
        }
    }

    return { sent: true };
}

//------------------------------------------------------------------------
/**
 * Notify users who are interested in similar posts to post with id: postId.
 *
 * @param {String}    postId            The id of the post to get the similar posts.
 * @param {Boolean}   isEmail           Indicates whether to send an email.
 * @param {Object}    [emailSubject]    The email subject, mandatory if isEmail=true.
 * @param {String}    [emailSubject.en] The email English subject.
 * @param {String}    [emailSubject.ar] The email Arabic subject.
 * @param {Object}    [emailMessage]    The email message, mandatory if isEmail=true.
 * @param {String}    [emailMessage.en] The email English message.
 * @param {String}    [emailMessage.ar] The email Arabic message.
 * @param {Boolean}   isPush            Indicates whether to send a push message.
 * @param {Object}    [pushTitle]       The push message title, mandatory if isPush=true.
 * @param {String}    [pushTitle.en]    The push message English title.
 * @param {String}    [pushTitle.ar]    The push message Arabic title.
 * @param {Object}    [pushBody]        The push message body, mandatory if isPush=true.
 * @param {String}    [pushBody.en]     The push message English body.
 * @param {String}    [pushBody.ar]     The push message Arabic body.
 * @param {Boolean}   isSMS             Indicates whether to send an SMS.
 * @param {Object}    [smsMessage]      The sms message, mandatory if isSMS=true.
 * @param {String}    [smsMessage.en]   The sms English message.
 * @param {String}    [smsMessage.ar]   The sms Arabic message.
 * @param {'primary','secondary'}   [smsService=primary]  The service to be user in sending the sms, mandatory if isSMS=true.
 *
 * @returns {Object} {sent: Boolean, err?:Error}
 */
async function notifyInterestedUsers(
    postId, isEmail, emailSubject, emailMessage, isPush,
    pushTitle, pushBody, isSMS, smsMessage, smsService = 'primary',
) {
    try {
        const post = await Post.findById(postId).select('thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const imageURI = `${storageLink}${post.thumbnail}`;

        const {
            error: postsError,
            results: posts,
            numberOfResults: numberOfPosts,
        } = await getSimilarPosts(postId);
        if (postsError) return { sent: false, err: postsError };
        if (numberOfPosts === 0 || isEmpty(posts)) {
            const error = new Error(`No posts similar to post <${postId}>`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const {
            error: usersError,
            results: users,
            numberOfResults: numberOfUsers,
        } = await getInterestedUsers(posts);
        if (usersError) return { sent: false, err: usersError };
        if (numberOfUsers === 0 || isEmpty(users)) {
            const error = new Error(`No users interested in posts similar to <${postId}>`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // Email is special because there's a limit for the number of emails to be sent.
        if (isEmail) {
            const { sent, err } = await sendBulkEmails(users, emailSubject, emailMessage, 'DealsAndOffers');
            if (!sent) winston.error(err);
        }

        if (isPush || isSMS) {
            const userIdsEn = [];
            const userIdsAr = [];
            const payloadsEn = [];
            const payloadsAr = [];
            const pushMessagesEn = [];
            const pushMessagesAr = [];
            for (let i = 0; i < users.length; i += 1) {
                const user = users[i];
                let payloadObj;
                let pushMessageEn;
                let pushMessageAr;
                if (isPush) {
                    pushMessageEn = {
                        title: pushTitle.en,
                        body: pushBody.en,
                        image: imageURI,
                    };
                    pushMessageAr = {
                        title: pushTitle.ar,
                        body: pushBody.ar,
                        image: imageURI,
                    };
                    payloadObj = {
                        read: false,
                        post: postId,
                        user: user._id,
                        type: 'bid',
                    };
                }
                if (user.language === 'en') {
                    userIdsEn.push(user._id);
                    if (isPush) {
                        payloadsEn.push(payloadObj);
                        pushMessagesEn.push(pushMessageEn);
                    }
                } else if (user.language === 'ar') {
                    userIdsAr.push(user._id);
                    if (isPush) {
                        payloadsAr.push(payloadObj);
                        pushMessagesAr.push(pushMessageAr);
                    }
                } else {
                    const error = new Error(`Undefined language <${user.language}> for user with ID <${user._id}>`);
                    winston.error(error);
                }
            }

            const notificationMeans = { isSMS, isPush };
            const paramsEn = {};
            const paramsAr = {};
            if (isPush) {
                paramsEn.push = {
                    messages: pushMessagesEn,
                    payloads: payloadsEn,
                };
                paramsAr.push = {
                    messages: pushMessagesAr,
                    payloads: payloadsAr,
                };
            }
            if (isSMS) {
                paramsEn.sms = {
                    message: smsMessage.en,
                    smsService,
                };
                paramsAr.sms = {
                    message: smsMessage.ar,
                    smsService,
                };
            }

            if (!isEmpty(userIdsEn)) {
                const { sent, err } = await sendNotifications(notificationMeans, paramsEn, userIdsEn, 'DealsAndOffers');
                if (!sent) winston.error(err);
            }
            if (!isEmpty(userIdsAr)) {
                const { sent, err } = await sendNotifications(notificationMeans, paramsAr, userIdsAr, 'DealsAndOffers');
                if (!sent) winston.error(err);
            }
        }

        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------
/**
 * Notify users who posted at least numberOfPosts posts.
 *
 * @param {Number}    numberOfPosts     The minimum number of posts that a user should submit in order to get notified.
 * @param {Boolean}   isEmail           Indicates whether to send an email.
 * @param {Object}    [emailSubject]    The email subject, mandatory if isEmail=true.
 * @param {String}    [emailSubject.en] The email English subject.
 * @param {String}    [emailSubject.ar] The email Arabic subject.
 * @param {Object}    [emailMessage]    The email message, mandatory if isEmail=true.
 * @param {String}    [emailMessage.en] The email English message.
 * @param {String}    [emailMessage.ar] The email Arabic message.
 * @param {Boolean}   isPush            Indicates whether to send a push message.
 * @param {Object}    [pushTitle]       The push message title, mandatory if isPush=true.
 * @param {String}    [pushTitle.en]    The push message English title.
 * @param {String}    [pushTitle.ar]    The push message Arabic title.
 * @param {Object}    [pushBody]        The push message body, mandatory if isPush=true.
 * @param {String}    [pushBody.en]     The push message English body.
 * @param {String}    [pushBody.ar]     The push message Arabic body.
 * @param {String}    [pushImage]       The push image name.
 * @param {Boolean}   isSMS             Indicates whether to send an SMS.
 * @param {Object}    [smsMessage]      The sms message, mandatory if isSMS=true.
 * @param {String}    [smsMessage.en]   The sms English message.
 * @param {String}    [smsMessage.ar]   The sms Arabic message.
 * @param {'primary','secondary'}   [smsService=primary]  The service to be user in sending the sms, mandatory if isSMS=true.
 *
 * @returns {Object} {sent: Boolean, err?:Error}
 */
async function notifyUsersWhoPosted(
    numberOfPosts, isEmail, emailSubject, emailMessage, isPush, pushTitle,
    pushBody, pushImage, isSMS, smsMessage, smsService = 'primary',
) {
    try {
        const aggregateQuery = [
            {
                $project: {
                    seller: 1,
                    _id: 0,
                },
            },
            {
                $group: {
                    _id: '$seller',
                    count: { $sum: 1 },
                },
            },
            {
                $match: {
                    count: { $gte: numberOfPosts },
                },
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $replaceRoot: {
                    newRoot: '$user',
                },
            },
            {
                $project: {
                    _id: 1,
                    language: 1,
                },
            },
        ];

        const users = await Post.aggregate(aggregateQuery);
        if (isEmpty(users)) {
            const error = new Error(`No users posted at least <${numberOfPosts}> posts`);
            winston.error(error);
            return { sent: false, err: error };
        }

        return await notifyUsersWithGenericPush(
            users, isEmail, emailSubject, emailMessage,
            isPush, pushTitle, pushBody, pushImage,
            isSMS, smsMessage, smsService, 'DealsAndOffers',
        );
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------
/**
 * Notify users who sold and completed at least numberOfOrders orders.
 *
 * @param {Number}    numberOfOrders    The minimum number of orders that a user should complete in order to get notified.
 * @param {Boolean}   isEmail           Indicates whether to send an email.
 * @param {Object}    [emailSubject]    The email subject, mandatory if isEmail=true.
 * @param {String}    [emailSubject.en] The email English subject.
 * @param {String}    [emailSubject.ar] The email Arabic subject.
 * @param {Object}    [emailMessage]    The email message, mandatory if isEmail=true.
 * @param {String}    [emailMessage.en] The email English message.
 * @param {String}    [emailMessage.ar] The email Arabic message.
 * @param {Boolean}   isPush            Indicates whether to send a push message.
 * @param {Object}    [pushTitle]       The push message title, mandatory if isPush=true.
 * @param {String}    [pushTitle.en]    The push message English title.
 * @param {String}    [pushTitle.ar]    The push message Arabic title.
 * @param {Object}    [pushBody]        The push message body, mandatory if isPush=true.
 * @param {String}    [pushBody.en]     The push message English body.
 * @param {String}    [pushBody.ar]     The push message Arabic body.
 * @param {String}    [pushImage]       The push image name.
 * @param {Boolean}   isSMS             Indicates whether to send an SMS.
 * @param {Object}    [smsMessage]      The sms message, mandatory if isSMS=true.
 * @param {String}    [smsMessage.en]   The sms English message.
 * @param {String}    [smsMessage.ar]   The sms Arabic message.
 * @param {'primary','secondary'}   [smsService=primary]  The service to be user in sending the sms, mandatory if isSMS=true.
 *
 * @returns {Object} {sent: Boolean, err?:Error}
 */
async function notifySellers(
    numberOfOrders, isEmail, emailSubject, emailMessage, isPush, pushTitle,
    pushBody, pushImage, isSMS, smsMessage, smsService = 'primary',
) {
    try {
        const aggregateQuery = [
            {
                $match: {
                    status: 'Completed',
                },
            },
            {
                $project: {
                    'sellerData.seller': 1,
                },
            },
            {
                $group: {
                    _id: '$sellerData.seller',
                    count: { $sum: 1 },
                },
            },
            {
                $match: {
                    count: { $gte: numberOfOrders },
                },
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $replaceRoot: {
                    newRoot: '$user',
                },
            },
            {
                $project: {
                    _id: 1,
                    language: 1,
                },
            },
        ];

        const users = await Order.aggregate(aggregateQuery);
        if (isEmpty(users)) {
            const error = new Error(`No users completed at least <${numberOfOrders}> orders`);
            winston.error(error);
            return { sent: false, err: error };
        }

        return await notifyUsersWithGenericPush(
            users, isEmail, emailSubject, emailMessage,
            isPush, pushTitle, pushBody, pushImage,
            isSMS, smsMessage, smsService, 'DealsAndOffers',
        );
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------
/**
 * Notify users from search results.
 *
 * @param {String}    [phone]           An exact phone number.
 * @param {String}    [email]           A partial or full email.
 * @param {'true' | 'false'}   [isVerified]      Whether to get the verified or unverified users, empty for all users.
 * @param {String}    [username]        A partial username.
 * @param {'true'}    [exempted]        Whether to get the exempted from commission users, empty for all users.
 * @param {Boolean}   isEmail           Indicates whether to send an email.
 * @param {Object}    [emailSubject]    The email subject, mandatory if isEmail=true.
 * @param {String}    [emailSubject.en] The email English subject.
 * @param {String}    [emailSubject.ar] The email Arabic subject.
 * @param {Object}    [emailMessage]    The email message, mandatory if isEmail=true.
 * @param {String}    [emailMessage.en] The email English message.
 * @param {String}    [emailMessage.ar] The email Arabic message.
 * @param {Boolean}   isPush            Indicates whether to send a push message.
 * @param {Object}    [pushTitle]       The push message title, mandatory if isPush=true.
 * @param {String}    [pushTitle.en]    The push message English title.
 * @param {String}    [pushTitle.ar]    The push message Arabic title.
 * @param {Object}    [pushBody]        The push message body, mandatory if isPush=true.
 * @param {String}    [pushBody.en]     The push message English body.
 * @param {String}    [pushBody.ar]     The push message Arabic body.
 * @param {Boolean}   isSMS             Indicates whether to send an SMS.
 * @param {Object}    [smsMessage]      The sms message, mandatory if isSMS=true.
 * @param {String}    [smsMessage.en]   The sms English message.
 * @param {String}    [smsMessage.ar]   The sms Arabic message.
 * @param {'primary','secondary'}   [smsService=primary]  The service to be user in sending the sms, mandatory if isSMS=true.
 *
 * @returns {Object} {sent: Boolean, err?:Error}
 */
async function notifyUsersFromSearch(
    phone, email, isVerified, username, exempted, isEmail, emailSubject, emailMessage,
    isPush, pushTitle, pushBody, pushImage, isSMS, smsMessage, smsService = 'primary',
) {
    try {
        const {
            error: usersError,
            results: users,
            numberOfResults: numberOfUsers,
        } = await searchUsers(phone, email, isVerified, username, exempted);
        if (usersError) return { sent: false, err: usersError };
        if (numberOfUsers === 0 || isEmpty(users)) {
            const error = new Error('No users matching the search query');
            winston.error(error);
            return { sent: false, err: error };
        }

        return await notifyUsersWithGenericPush(
            users, isEmail, emailSubject, emailMessage,
            isPush, pushTitle, pushBody, pushImage,
            isSMS, smsMessage, smsService, 'DealsAndOffers',
        );
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------
export {
    notifyInterestedUsers,
    notifyUsersWhoPosted,
    notifySellers,
    notifyUsersFromSearch,
};

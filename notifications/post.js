/**
 * Post Notifications
 * @module
 */

import config from 'config';
import winston from 'winston';

import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';

import Post from '../models/post.js';
import User from '../models/user.js';

//------------------------------------------------------------------------------
const storageHost = config.get('storage_host');
const thumbnailsContainerName = config.get('post.thumbnailsContainerName');
const storageLink = `${storageHost}${thumbnailsContainerName}/`;

//------------------------------------------------------------------------------
async function notifyPostExpiredWithoutSelling(postId) {
    try {
        const post = await Post.findById(postId).select('_id title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('_id username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            type: 'post',
        };

        const pushBody = messages[user.language].post.postExpiredWithoutSellingPushBody(post.title);
        const pushSubject = messages[user.language].post.postExpiredWithoutSellingPushSubject;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postExpiredWithoutSellingMailSubject,
                text: messages[user.language].post.postExpiredWithoutSellingMailBody(user.username, post.title),
                language: user.language,
            },
            push: {
                messages: [{
                    title: pushSubject,
                    body: pushBody,
                    image: `${storageLink}${post.thumbnail}`,
                }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'PostActions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyPostExpiredWithQuantityRemaining(postId) {
    try {
        const post = await Post.findById(postId).select('_id title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('_id username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            type: 'post',
        };

        const pushBody = messages[user.language].post.postExpiredWithQuantityRemainingPushBody(post.title);
        const pushSubject = messages[user.language].post.postExpiredWithQuantityRemainingPushSubject;
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postExpiredWithQuantityRemainingMailSubject,
                text: messages[user.language].post.postExpiredWithQuantityRemainingMailBody(user.username, post.title),
                language: user.language,
            },
            push: {
                messages: [{
                    title: pushSubject,
                    body: pushBody,
                    image: `${storageLink}${post.thumbnail}`,
                }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'PostActions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyRecommendedPost(postId, userPercentage, englishNotifTitle, englishNotifBody, arabicNotifTitle, arabicNotifBody) {
    const post = await Post.findById(postId, '_id thumbnail').lean();
    if (isEmpty(post)) {
        const error = new Error(`Post with ID <${postId}> not found`);
        winston.error(error);
        return { sent: false, err: error };
    }

    const usersCount = await User.estimatedDocumentCount();
    const usersReqCount = Math.round(usersCount * (userPercentage / 100));

    const matchQuery = { 'banning.isBanned': false };

    const aggregateQuery = [
        {
            $match: matchQuery,
        },
        {
            $project: {
                _id: 1,
                language: 1,
            },
        },
        {
            $sample: { size: usersReqCount },
        },
    ];

    const users = await User.aggregate(aggregateQuery);
    const userIds = [];
    const pushMessages = [];
    const payloads = [];
    for (let i = 0; i < users.length; i += 1) {
        try {
            userIds.push(users[i]._id);

            const payloadObj = {
                read: false,
                post: post._id,
                user: users[i]._id,
                type: 'bid',
            };
            payloads.push(payloadObj);

            const pushBody = (users[i].language === 'en') ? englishNotifBody : arabicNotifBody;
            const pushSubject = (users[i].language === 'en') ? englishNotifTitle : arabicNotifTitle;
            pushMessages.push({
                title: pushSubject,
                body: pushBody,
                image: `${storageLink}${post.thumbnail}`,
            });
        } catch (error) {
            winston.error(`Something went wrong when creating the recommend post payload for user <${users[i]._id}>`);
        }
    }

    const notificationMeans = { isPush: true };
    const params = { push: { messages: pushMessages, payloads } };

    const isNotificationSent = await sendNotifications(notificationMeans, params, userIds, 'DealsAndOffers');
    return isNotificationSent;
}

//------------------------------------------------------------------------------
async function notifySellerWithFirstBid(postId) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = post.seller;
        const seller = await User.findById(sellerId).select('language username').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerPushTitle = messages[seller.language].post.firstBidPushSubject;
        const sellerPushBody = messages[seller.language].post.firstBidPushBody(post.title);

        const sellerPayloadObj = {
            post: postId,
            read: false,
            user: sellerId,
            type: 'post',
            userType: 'seller',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].post.firstBidMailSubject,
                text: messages[seller.language].post.firstBidMailBody(seller.username, post.title),
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushTitle, body: sellerPushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [sellerPayloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyPostUnderReview(postId) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            user: userId,
            post: postId,
            type: 'post',
        };

        const pushBody = messages[user.language].post.postUnderReviewPushBody(post.title);
        const pushSubject = messages[user.language].post.postUnderReviewPushSubject;
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postUnderReviewMailSubject,
                text: messages[user.language].post.postUnderReviewMailBody(user.username, post.title),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyPostAccepted(postId, isNewPost) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            type: 'post',
        };

        const pushBody = messages[user.language].post.postAcceptedPushBody(post.title, isNewPost ? config.get('auction.silverCoinMultipleForPosting') : undefined);
        const pushSubject = messages[user.language].post.postAcceptedPushSubject;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postAcceptedMailSubject,
                text: messages[user.language].post.postAcceptedMailBody(user.username, post.title, isNewPost ? config.get('auction.silverCoinMultipleForPosting') : undefined),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyPostRejected(postId) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail declineReason.otherReason').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            type: 'post',
        };

        const rejectReason = post.declineReason?.otherReason || messages[user.language].post.generalRejectReason; // Should never use generalRejectReason, but just in case.
        const pushSubject = messages[user.language].post.postRejectedPushSubject(rejectReason);
        const pushBody = messages[user.language].post.postRejectedPushBody(post.title, rejectReason);
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postRejectedMailSubject,
                text: messages[user.language].post.postRejectedMailBody(user.username, post.title, rejectReason),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyPostDeclined(postId) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            type: 'post',
        };

        const pushBody = messages[user.language].post.postDeclinedPushBody(post.title);
        const pushSubject = messages[user.language].post.postDeclinedPushSubject;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postDeclinedMailSubject,
                text: messages[user.language].post.postDeclinedMailBody(user.username, post.title),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'PostActions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyPostAcceptedAuction(postId, isNewPost) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${post.seller}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            type: 'post',
        };

        const pushBody = messages[user.language].post.postAcceptedPushBody(post.title, isNewPost ? config.get('auction.silverCoinMultipleForPosting') : undefined);
        const pushSubject = messages[user.language].post.postAcceptedPushSubject;
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postAcceptedMailSubject,
                text: messages[user.language].post.postAcceptedMailBody(user.username, post.title, isNewPost ? config.get('auction.silverCoinMultipleForPosting') : undefined),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifySellerPostReposted(postId) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            userType: 'seller',
            type: 'post',
        };

        const pushBody = messages[user.language].post.postRepostSuccessPushBody(post.title);
        const pushSubject = messages[user.language].post.postRepostSuccessPushSubject;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].post.postRepostSuccessMailSubject,
                text: messages[user.language].post.postRepostSuccessMailBody(user.username, post.title),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyPostDataAppendedOutcome(postId, accepted, declineReason) {
    try {
        const post = await Post.findById(postId).select('title seller thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            userType: 'seller',
            type: 'post',
        };

        let pushBody; let pushSubject; let mailBody; let mailSubject;

        if (accepted) {
            pushBody = messages[user.language].post.postDataAppendedAcceptedPushBody(post.title);
            pushSubject = messages[user.language].post.postDataAppendedAcceptedPushSubject;
            mailBody = messages[user.language].post.postDataAppendedAcceptedMailBody(user.username, post.title);
            mailSubject = messages[user.language].post.postDataAppendedAcceptedMailSubject;
        } else {
            pushBody = messages[user.language].post.postDataAppendedDeclinedPushBody(post.title);
            pushSubject = messages[user.language].post.postDataAppendedDeclinedPushSubject;
            mailBody = messages[user.language].post.postDataAppendedDeclinedMailBody(user.username, post.title, declineReason);
            mailSubject = messages[user.language].post.postDataAppendedDeclinedMailSubject;
        }

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: mailSubject,
                text: mailBody,
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifyUserPremiumFeesPaid(postId, userId, dueAmount) {
    try {
        const post = await Post.findById(postId).select('esId title thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            post: postId,
            user: userId,
            type: 'bid',
        };

        const host = config.get('frontend_host');
        const postLink = `${host}post/${postId}`;
        const pushBody = messages[user.language].post.premiumPostFeesPaidPushBody(post.esId);
        const pushSubject = messages[user.language].post.premiumPostFeesPaidPushSubject;
        const mailBody = messages[user.language].post.premiumPostFeesPaidMailBody(user.username, post.esId, post.title, postLink, dueAmount);
        const mailSubject = messages[user.language].post.premiumPostFeesPaidMailSubject;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: mailSubject,
                text: mailBody,
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'Receipts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------------
async function notifySellerToSwitchSecured(postId, commission) {
    try {
        const post = await Post.findById(postId)
            .select([
                'esId',
                'seller',
                'thumbnail',
            ])
            .lean();
        if (isEmpty(post) || !post.seller) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return {
                sent: false,
                err: error,
            };
        }

        const userId = post.seller;
        const user = await User.findById(userId)
            .select([
                'language',
                'username',
            ]).lean();
        if (isEmpty(user)) {
            const error = new Error(
                `Seller with ID <${userId}> for post with ID <${postId}> not found`,
            );
            winston.error(error);
            return {
                sent: false,
                err: error,
            };
        }

        const payloadObj = {
            post: postId,
            read: false,
            type: 'post',
            user: userId,
            userType: 'seller',
        };

        // in the notification list only the title is shown!
        const pushSubject = messages[user.language].post.postRequestToSwitchSecuredPushSubject;
        const pushBody = messages[user.language].post.postRequestToSwitchSecuredPushBody(post.esId, commission * 100);

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [
                    {
                        title: pushSubject,
                        body: pushBody,
                    },
                ],
                payloads: [
                    payloadObj,
                ],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'PostActions');
    } catch (error) {
        return {
            sent: false,
            err: error,
        };
    }
}

//------------------------------------------------------------------------------
export {
    notifyPostExpiredWithoutSelling,
    notifyPostExpiredWithQuantityRemaining,
    notifyRecommendedPost,
    notifySellerWithFirstBid,
    notifyPostUnderReview,
    notifyPostAccepted,
    notifyPostRejected,
    notifyPostDeclined,
    notifyPostAcceptedAuction,
    notifySellerPostReposted,
    notifyPostDataAppendedOutcome,
    notifyUserPremiumFeesPaid,
    notifySellerToSwitchSecured,
};

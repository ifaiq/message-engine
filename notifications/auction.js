/**
* Auction Notifications
* @module
*/

import config from 'config';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import winston from 'winston';
import messages from '../i18n/i18n.js';
import equalObjectIds from '../misc/equalObjectIds.js';
import isEmpty from '../misc/isEmpty.js';
import sendBulkEmails from '../misc/sendBulkEmails.js';
import sendNotifications from '../misc/notifications.js';
import Auction from '../models/auction.js';
import Order from '../models/order.js';
import Post from '../models/post.js';
import PromotionalAuction from '../models/promotionalAuction.js';
import PromotionalPost from '../models/promotionalPost.js';
import User from '../models/user.js';

const timezone = config.get('timezone');
const storageHost = config.get('storage_host');
const thumbnailsContainerName = config.get('post.thumbnailsContainerName');
const storageLink = `${storageHost}${thumbnailsContainerName}/`;
const promotionalThumbnailsContainerName = config.get('promotionalPost.thumbnailsContainerName');
const promotionalStorageLink = `${storageHost}${promotionalThumbnailsContainerName}/`;

async function notifyAuctionWinner(winnerId, postId, orderId) {
    try {
        const winner = await User.findById(winnerId, 'username language').lean();
        if (isEmpty(winner)) {
            const error = new Error(`User with ID <${winnerId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const post = await Post.findById(postId, 'title thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const pushSubject = messages[winner.language].auction.auctionWonPushSubject;
        const pushBody = messages[winner.language].auction.auctionWonPushBody(post.title);
        const payloadObj = {
            read: false,
            user: winnerId,
            type: 'order',
            order: orderId,
            userType: 'buyer',
        };
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[winner.language].auction.auctionWonEmailSubject,
                text: messages[winner.language].auction.auctionWonEmailBody(winner.username, post.title),
                language: winner.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [winnerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifySellerAuctionWon(sellerId, postId, orderId, window) {
    try {
        const seller = await User.findById(sellerId, 'username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const post = await Post.findById(postId, 'title thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const order = await Order.findById(orderId, 'esId dropOffPeriodEnd checkOutTime soldPrice').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const expiryDate = moment(order.dropOffPeriodEnd).tz(timezone).locale(seller.language).format('DD/MM/YYYY');
        const expiryTime = moment(order.dropOffPeriodEnd).tz(timezone).locale(seller.language).format('hh:mm a');
        const creationDate = moment(order.checkOutTime).tz(timezone).locale(seller.language).format('DD/MM/YYYY');
        const creationTime = moment(order.checkOutTime).tz(timezone).locale(seller.language).format('hh:mm a');

        const link = `${config.get('frontend_host')}order/seller/dropOff/${orderId}?lang=${seller.language}`;
        const pushSubject = messages[seller.language].auction.auctionWonSellerPushSubject;
        const pushBody = messages[seller.language].auction.auctionWonSellerPushBody(post.title, window);
        const payloadObj = {
            read: false,
            user: sellerId,
            type: 'order',
            order: orderId,
            userType: 'seller',
        };
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].auction.auctionWonSellerEmailSubject,
                text: messages[seller.language].auction.auctionWonSellerEmailBody(seller.username, expiryDate, expiryTime, order.esId, link, creationDate, creationTime, post.title, 1, order.soldPrice),
                language: seller.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody, image: `${storageLink}${post.thumbnail}` }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'MyAppointments');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyHighestBidderItemSold(auctionId) {
    try {
        const auction = await Auction.findById(auctionId, 'biddingHistory lastBid status')
            .populate({
                path: 'post',
                model: Post,
                select: ['title'],
            })
            .lean();

        if (isEmpty(auction) || auction.status !== 'Ended') {
            const error = new Error(`Auction with ID <${auctionId}> not found or still not ended`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (!auction.lastBid || !auction.lastBid.user || !auction.biddingHistory || auction.biddingHistory.length === 0) {
            const error = new Error(`Auction with ID <${auctionId}> does not contain a last bid or a bidding history or bidding history is empty.`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (auction.biddingHistory.length === 1) {
            winston.debug(`Auction with id ${auctionId} has only one bidder which means this is the user placing the order`);
            return { sent: true };
        }

        const userId = auction.biddingHistory[auction.biddingHistory.length - 2].user;
        if (auction.lastBid.user.toLocaleString() === userId.toLocaleString()) {
            winston.debug('Notify highest bidder item sold by buy now skipped because the highest bidder is the user who bought the item');
            return { sent: true };
        }

        const user = await User.findById(userId, 'username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const pushSubject = messages[user.language].auction.auctionSoldByBuyNowPushSubject;
        const pushBody = messages[user.language].auction.auctionSoldByBuyNowPushBody(auction.post.title);
        const payloadObj = {
            read: false,
            user: userId,
            type: 'bid',
            post: auction.post._id,
        };
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].auction.auctionSoldByBuyNowEmailSubject,
                text: messages[user.language].auction.auctionSoldByBuyNowEmailBody(user.username, auction.post.title),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'MyAuctions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyPreviousBidderOutbid(prevHighestBidderId, actualBidder, newBid, postId) {
    try {
        const user = await User.findById(prevHighestBidderId, 'language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${prevHighestBidderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const post = await Post.findById(postId, 'thumbnail auction').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const pushSubject = messages[user.language].auction.outbidPushSubject;
        const pushBody = messages[user.language].auction.outbidPushBody(newBid);
        const payloadObj = {
            read: false,
            user: user._id,
            type: 'bid',
            avatar: actualBidder,
            post: postId,
        };

        const notificationMeans = { isPush: true };
        const pushMessage = {
            title: pushSubject,
            body: pushBody,
            image: `${storageLink}${post.thumbnail}`,
            collapse_key: `${post.auction}-outbid`,
        };
        const params = {
            push: {
                messages: [pushMessage],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [prevHighestBidderId], 'MyAuctions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyBiddersAuctionAboutToEnd(postId) {
    try {
        const post = await Post.findById(postId).select('status title thumbnail auction').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (post.status !== 'available') {
            winston.debug(`Post with ID <${postId}> not available anymore`);
            return { sent: true };
        }

        const auction = await Auction.findById(post.auction).select('biddingHistory status').lean();
        if (isEmpty(auction)) {
            const error = new Error(`Auction with ID <${post.auction}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (auction.status !== 'Running') {
            winston.debug(`Auction with ID <${post.auction}> not running anymore`);
            return { sent: true };
        }

        // notify only in case there is more than one bidder
        if (auction.biddingHistory.length < 2) {
            winston.debug(`Auction with ID <${post.auction}> has no bidders or one bidder only`);
            return { sent: true };
        }

        const usersNotToNotify = [];
        usersNotToNotify.push(auction.biddingHistory[auction.biddingHistory.length - 1].user.toString()); // no need to notify highest bidder

        const userIds = [];
        const pushMessages = [];
        const payloads = [];
        for (let i = 0; i < auction.biddingHistory.length; i += 1) {
            const userId = auction.biddingHistory[i].user;
            try {
                const user = await User.findById(userId).select('language banning watchList').lean();
                if (isEmpty(user)) {
                    const error = new Error(`User with ID <${userId}> not found`);
                    winston.error(error);
                    continue;
                }

                if (user.banning.isBanned === true || usersNotToNotify.findIndex((userToFind) => equalObjectIds(userToFind, userId)) !== -1) continue;
                usersNotToNotify.push(userId.toString()); // to avoid notifying again

                if (user.watchList && user.watchList.length > 0 && user.watchList.findIndex((postToFind) => equalObjectIds(postToFind, postId)) !== -1) continue;

                userIds.push(userId);

                const payloadObj = {
                    read: false,
                    user: userId,
                    type: 'bid',
                    post: postId,
                };
                payloads.push(payloadObj);

                const pushSubject = messages[user.language].auction.notifyBiddersAuctionRunningOutPushSubject;
                const pushBody = messages[user.language].auction.notifyBiddersAuctionRunningOutPushBody(post.title);

                pushMessages.push({
                    title: pushSubject,
                    body: pushBody,
                    image: `${storageLink}${post.thumbnail}`,
                });
            } catch (error) {
                winston.error(`Something went wrong when creating the auction running out payload for user <${userId}>`);
            }
        }

        const notificationMeans = { isPush: true };
        const params = { push: { messages: pushMessages, payloads } };

        return await sendNotifications(notificationMeans, params, userIds, 'MyAuctions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------
/**
 * Notify bidders on an auction with a personalized notification.
 *
 * @param {Boolean}   isPromotionalPost Indicates whether the post is a promotional post or regular one.
 * @param {String}    auctionId         The id of the auction to get the bidders.
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
async function notifyBiddersPersonal(
    isPromotionalPost, auctionId, isEmail, emailSubject, emailMessage,
    isPush, pushTitle, pushBody, isSMS, smsMessage, smsService = 'primary',
) {
    try {
        const aggregateQuery = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(auctionId),
                },
            },
            {
                $project: {
                    userIds: '$biddingHistory.user',
                },
            },
            {
                $unwind: '$userIds',
            },
            {
                $group: {
                    _id: auctionId,
                    userIds: { $addToSet: '$userIds' },
                },
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: 'userIds',
                    foreignField: '_id',
                    as: 'users',
                },
            },
            {
                $project: {
                    'users._id': 1,
                    'users.language': 1,
                },
            },
        ];
        let users;
        let postId;
        let imageURI;
        if (isPromotionalPost) {
            const auction = await PromotionalAuction.aggregate(aggregateQuery);
            if (isEmpty(auction) || isEmpty(auction[0])) {
                const error = new Error(`Special Auction with ID <${auctionId}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            ([{ users }] = auction);
            const post = await PromotionalPost.findOne({ auction: auctionId }).select('thumbnail').lean();
            if (isEmpty(post)) {
                const error = new Error(`Promotional Post for auction with ID <${auctionId}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            postId = post._id;
            imageURI = `${promotionalStorageLink}${post.thumbnail}`;
        } else {
            const auction = await Auction.aggregate(aggregateQuery);
            if (isEmpty(auction) || isEmpty(auction[0])) {
                const error = new Error(`Auction with ID <${auctionId}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            ([{ users }] = auction);
            const post = await Post.findOne({ auction: auctionId }).select('thumbnail').lean();
            if (isEmpty(post)) {
                const error = new Error(`Post for auction with ID <${auctionId}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            postId = post._id;
            imageURI = `${storageLink}${post.thumbnail}`;
        }

        if (isEmpty(users)) {
            const error = new Error(`No bidders on auction <${auctionId}>`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // Email is special because there's a limit for the number of emails to be sent.
        if (isEmail) {
            const { sent, err } = await sendBulkEmails(users, emailSubject, emailMessage, 'MyAuctions');
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
                    pushMessageEn = { title: pushTitle.en, body: pushBody.en, image: imageURI };
                    pushMessageAr = { title: pushTitle.ar, body: pushBody.ar, image: imageURI };
                    if (isPromotionalPost) {
                        payloadObj = {
                            read: false, promotionalPost: postId, user: user._id, type: 'special',
                        };
                    } else {
                        payloadObj = {
                            read: false, post: postId, user: user._id, type: 'bid',
                        };
                    }
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
                paramsEn.push = { messages: pushMessagesEn, payloads: payloadsEn };
                paramsAr.push = { messages: pushMessagesAr, payloads: payloadsAr };
            }
            if (isSMS) {
                paramsEn.sms = { message: smsMessage.en, smsService };
                paramsAr.sms = { message: smsMessage.ar, smsService };
            }

            if (!isEmpty(userIdsEn)) {
                const { sent, err } = await sendNotifications(notificationMeans, paramsEn, userIdsEn, 'MyAuctions');
                if (!sent) winston.error(err);
            }
            if (!isEmpty(userIdsAr)) {
                const { sent, err } = await sendNotifications(notificationMeans, paramsAr, userIdsAr, 'MyAuctions');
                if (!sent) winston.error(err);
            }
        }

        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

//------------------------------------------------------------------------
export {
    notifyAuctionWinner,
    notifySellerAuctionWon,
    notifyHighestBidderItemSold,
    notifyPreviousBidderOutbid,
    notifyBiddersAuctionAboutToEnd,
    notifyBiddersPersonal,
};

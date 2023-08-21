/**
* Promotional Auction Notifications
* @module
*/

import winston from 'winston';
import config from 'config';
import messages from '../i18n/i18n.js';
import equalObjectIds from '../misc/equalObjectIds.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import PromotionalAuction from '../models/promotionalAuction.js';
import PromotionalPost from '../models/promotionalPost.js';
import User from '../models/user.js';

const storageHost = config.get('storage_host');
const thumbnailsContainerName = config.get('promotionalPost.thumbnailsContainerName');
const storageLink = `${storageHost}${thumbnailsContainerName}/`;

async function notifyPromotionalAuctionWinner(winnerId, postId, brandName) {
    try {
        const winner = await User.findById(winnerId, 'username language').lean();
        if (isEmpty(winner)) {
            const error = new Error(`User with ID <${winnerId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const post = await PromotionalPost.findById(postId, 'title thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Promotional Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const postTitle = (winner.language === 'en') ? post.title.english : post.title.arabic;
        const pushSubject = messages[winner.language].promotionalAuction.promotionalAuctionWonPushSubject;
        const pushBody = messages[winner.language].promotionalAuction.promotionalAuctionWonPushBody(postTitle, brandName);

        const payloadObj = {
            read: false,
            user: winnerId,
            type: 'order',
            userType: 'buyer',
            order: post._id,
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[winner.language].promotionalAuction.promotionalAuctionWonEmailSubject,
                text: messages[winner.language].promotionalAuction.promotionalAuctionWonEmailBody(winner.username, postTitle, brandName),
                language: winner.language,
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

        return await sendNotifications(notificationMeans, params, [winnerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifyPreviousBidderOutbid(prevHighestBidderId, newBid, auctionId) {
    try {
        const post = await PromotionalPost.findOne({ auction: auctionId }).select('esId thumbnail');
        if (isEmpty(post)) {
            const error = new Error(`Promotional post for auction with ID <${auctionId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const user = await User.findById(prevHighestBidderId, 'username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${prevHighestBidderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const pushSubject = messages[user.language].auction.outbidPushSubject;
        const pushBody = messages[user.language].auction.outbidPushBody(newBid);

        const payloadObj = {
            read: false,
            user: prevHighestBidderId,
            type: 'special',
            promotionalPost: post._id,
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{
                    title: pushSubject,
                    body: pushBody,
                    image: `${storageLink}${post.thumbnail}`,
                    collapse_key: `${auctionId}-outbid`,
                }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [prevHighestBidderId], 'MyAuctions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyBiddersPromotionalAuctionAboutToEnd(postId) {
    try {
        const post = await PromotionalPost.findById(postId).select('status title auction thumbnail').lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (post.status !== 'available') {
            winston.debug(`Promotional Post with ID <${postId}> not available anymore`);
            return { sent: true };
        }

        const auction = await PromotionalAuction.findById(post.auction).select('biddingHistory status').lean();
        if (isEmpty(auction)) {
            const error = new Error(`Auction with ID <${post.auction}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (auction.status !== 'Running') {
            winston.debug(`Promotional Auction with ID <${post.auction}> not running anymore`);
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
                const user = await User.findById(userId).select('language banning specialsWatchList').lean();
                if (isEmpty(user)) {
                    const error = new Error(`User with ID <${userId}> not found`);
                    winston.error(error);
                    continue;
                }

                if (user.banning.isBanned === true || usersNotToNotify.findIndex((userToFind) => equalObjectIds(userToFind, auction.biddingHistory[i].user)) !== -1) continue;
                usersNotToNotify.push(userId.toString()); // to avoid notifying again

                if (user.specialsWatchList && user.specialsWatchList.length > 0 && user.specialsWatchList.findIndex((postToFind) => equalObjectIds(postToFind, postId)) !== -1) continue;

                userIds.push(userId);
                const payloadObj = {
                    read: false,
                    user: userId,
                    type: 'special',
                    promotionalPost: postId,
                };
                payloads.push(payloadObj);

                const pushBody = messages[user.language].promotionalAuction.notifyBiddersPromotionalAuctionRunningOutPushBody(user.language === 'en' ? post.title.english : post.title.arabic);
                const pushSubject = messages[user.language].promotionalAuction.notifyBiddersPromotionalAuctionRunningOutPushSubject;

                pushMessages.push({
                    title: pushSubject,
                    body: pushBody,
                    image: `${storageLink}${post.thumbnail}`,
                });
            } catch (error) {
                winston.error(`Something went wrong when creating the promotional auction running out payload for user <${auction.biddingHistory[i].user}>`);
            }
        }

        const notificationMeans = { isPush: true };
        const params = { push: { messages: pushMessages, payloads } };

        return await sendNotifications(notificationMeans, params, userIds, 'MyAuctions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyPromotionalAuctionWinner,
    notifyPreviousBidderOutbid,
    notifyBiddersPromotionalAuctionAboutToEnd,
};

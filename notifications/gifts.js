/**
* Gifts Notifications
* @module
*/

import winston from 'winston';
import config from 'config';
import moment from 'moment';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Gift from '../models/gift.js';
import User from '../models/user.js';
import Voucher from '../models/voucher.js';

const projectXFrontendHost = config.get('frontend_host');

//--------------------------------------------------------------
async function notifyGiftUnlocked(giftId) {
    try {
        const gift = await Gift.findById(giftId, 'status user giftNumber personalVoucher giftVoucher').lean();
        if (isEmpty(gift)) {
            const error = new Error(`Gift with ID <${giftId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (gift.status !== 'unlocked' && gift.status !== 'halfClaimed') {
            winston.debug(`Gift with Id ${giftId} not unlocked nor halfClaimed cannot notify with gift unlocked`);
            return { sent: true };
        }

        let voucherId;
        if (gift.giftNumber === 2 || gift.giftNumber === 4 || (gift.giftNumber === 5 && gift.status !== 'unlocked')) {
            voucherId = gift.personalVoucher;
        } else if ((gift.giftNumber === 5 && gift.personalVoucher === undefined)) {
            voucherId = gift.giftVoucher;
        }

        let voucher;
        if (voucherId !== undefined) {
            voucher = await Voucher.findById(voucherId, 'value percentage').lean();
            if (isEmpty(voucher)) {
                const error = new Error(`Voucher with ID <${voucherId}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
        }

        const winnerId = gift.user;
        const winner = await User.findById(winnerId, 'language').lean();
        if (isEmpty(winner)) {
            const error = new Error(`User with ID <${winnerId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const primaryValueGift6 = config.get('gifts.gift6PrimaryValue');
        const secondaryValueGift6 = config.get('gifts.gift6SecondaryValue');
        let pushSubject;
        let pushBody;
        switch (gift.giftNumber) {
            case 1:
                pushSubject = messages[winner.language].gifts.gift1UnlockedPushSubject;
                pushBody = messages[winner.language].gifts.gift1UnlockedPushBody;
                break;
            case 2:
                pushSubject = messages[winner.language].gifts.gift2And4UnlockedPushSubject(voucher.percentage);
                pushBody = messages[winner.language].gifts.gift2And4UnlockedPushBody(voucher.percentage);
                break;
            case 3:
                pushSubject = messages[winner.language].gifts.gift3UnlockedPushSubject;
                pushBody = messages[winner.language].gifts.gift3UnlockedPushBody;
                break;
            case 4:
                pushSubject = messages[winner.language].gifts.gift2And4UnlockedPushSubject(voucher.percentage);
                pushBody = messages[winner.language].gifts.gift2And4UnlockedPushBody(voucher.percentage);
                break;
            case 5:
                if (gift.status === 'unlocked') {
                    pushSubject = messages[winner.language].gifts.gift5Part1UnlockedPushSubject;
                    pushBody = messages[winner.language].gifts.gift5Part1UnlockedPushBody;
                } else {
                    pushSubject = messages[winner.language].gifts.gift5Part2UnlockedPushSubject;
                    pushBody = messages[winner.language].gifts.gift5Part2UnlockedPushBody;
                }
                break;
            case 6:
                pushSubject = messages[winner.language].gifts.gift6Part1UnlockedPushSubject;
                pushBody = messages[winner.language].gifts.gift6Part1UnlockedPushBody(primaryValueGift6, secondaryValueGift6);
                break;
            default:
                break;
        }

        const payloadObj = {
            read: false,
            user: winnerId,
            type: 'gift',
            gift: giftId,
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [winnerId], 'MyAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//--------------------------------------------------------------
async function notifyEarnFreeGift() {
    const gifts = await Gift.find({ giftNumber: 5, status: 'locked' }, 'user').lean();
    if (gifts.length < 1) {
        winston.debug('There are no users to notify with earn gift, all users have all gifts unlocked');
        return { sent: true };
    }

    const pushMessages = [];
    const payloads = [];
    const userIdsEn = [];
    const userIdsAr = [];
    for (let i = 0; i < gifts.length; i += 1) {
        const userId = gifts[i].user;
        try {
            const user = await User.findById(userId, 'language').lean();
            if (isEmpty(user)) {
                const error = new Error(`User with ID <${userId}> not found`);
                winston.error(error);
                continue;
            }

            if (user.language === 'en') userIdsEn.push(userId);
            else userIdsAr.push(userId);

            const payloadObj = {
                read: false,
                user: user._id,
                type: 'gift',
                gift: gifts[i]._id,
            };
            payloads.push(payloadObj);
            const pushSubject = messages[user.language].gifts.earnFreeGiftPushSubject;
            const pushBody = messages[user.language].gifts.earnFreeGiftPushBody;

            pushMessages.push({
                title: pushSubject,
                body: pushBody,
            });
        } catch (error) {
            winston.error(`Something went wrong when creating the earn free gift payload for user <${userId}>`);
        }
    }
    const userIds = [...userIdsEn, ...userIdsAr];
    const notificationMeansPush = { isPush: true };
    const params = {
        push: { messages: pushMessages, payloads },

    };
    const { sent: sentPush, err: errPush } = await sendNotifications(notificationMeansPush, params, userIds, 'DealsAndOffers');
    if (!sentPush) {
        winston.error(`Something went wrong while sending the earn free gift push notifications to users. Error: <${errPush}>`);
    }

    const enlink = `${projectXFrontendHost}home?lang=en`;
    const arlink = `${projectXFrontendHost}home?lang=ar`;

    const notificationMeansSMS = { isSMS: true };
    const paramsEn = {
        sms: {
            message: messages.en.gifts.earnFreeGiftSMSBody(enlink),
            service: 'primary',
        },
    };
    const paramsAr = {
        sms: {
            message: messages.ar.gifts.earnFreeGiftSMSBody(arlink),
            service: 'primary',
        },
    };

    const { sent: sentSMSEn, err: errSMSEn } = await sendNotifications(notificationMeansSMS, paramsEn, userIdsEn, 'DealsAndOffers');
    if (!sentSMSEn) {
        winston.error(`Something went wrong while sending the earn free gift SMS to users. Error: <${errSMSEn}>`);
    }
    const { sent: sentSMSAr, err: errSMSAr } = await sendNotifications(notificationMeansSMS, paramsAr, userIdsAr, 'DealsAndOffers');
    if (!sentSMSAr) {
        winston.error(`Something went wrong while sending the earn free gift SMS to users. Error: <${errSMSAr}>`);
    }

    return { sent: true };
}

//--------------------------------------------------------------
async function notifyGiftBlocked(giftId) {
    try {
        const gift = await Gift.findById(giftId, 'status user giftNumber personalVoucher giftVoucher').lean();
        if (isEmpty(gift)) {
            const error = new Error(`Gift with ID <${giftId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (gift.status !== 'blocked') {
            winston.debug(`Gift with Id ${giftId} not blocked. Cannot notify with gift blocked`);
            return { sent: true };
        }

        if (gift.giftNumber !== 6) {
            winston.debug(`Gift with Id ${giftId} is not gift 6. Cannot notify with gift blocked`);
            return { sent: true };
        }

        const user = await User.findById(gift.user);
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${gift.user}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const earnedSoFar = gift.accumulatedGiftValue;
        const pushSubject = messages[user.language].gifts.gift6Part2RelockedPushSubject;
        const pushBody = messages[user.language].gifts.gift6Part2RelockedPushBody(earnedSoFar);
        const payloadObj = {
            read: false,
            user: gift.user,
            type: 'gift',
            gift: giftId,
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [gift.user], 'MyAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//--------------------------------------------------------------
async function notifyGiftExpiry(giftId) {
    try {
        const gift = await Gift.findById(giftId).select('giftNumber status user expiryDate').lean();
        if (isEmpty(gift)) {
            winston.debug('gift not found');
            const error = new Error('gift not found');
            return { sent: false, err: error };
        }
        if (gift.status !== 'unlocked') {
            const error = new Error('invalid gift status');
            return { sent: false, err: error };
        }
        const user = await User.findById(gift.user).select('language').lean();
        if (isEmpty(user)) {
            winston.debug(`User with ID <${gift.user}> not found`);
            const error = new Error(`User with ID <${gift.user}> not found`);
            return { sent: false, err: error };
        }
        const expiryDateFormatted = user.language === 'en' ? moment(gift.expiryDate).format('D/M/YYYY') : moment(gift.expiryDate).format('YYYY/M/D');
        const pushSubject = messages[user.language].gifts.giftExpirySubject;
        const pushBody = messages[user.language].gifts.giftExpiryBody(gift.giftNumber, expiryDateFormatted);
        const payloadObj = {
            read: false,
            user: gift.user,
            type: 'gift',
            gift: giftId,
        };
        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [gift.user], 'MyMazadatCommunity');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//--------------------------------------------------------------
export {
    notifyGiftUnlocked,
    notifyEarnFreeGift,
    notifyGiftBlocked,
    notifyGiftExpiry,
};

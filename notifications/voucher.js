/**
* Voucher Notifications
* @module
*/

import winston from 'winston';
import config from 'config';
import moment from 'moment-timezone';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import User from '../models/user.js';
import Voucher from '../models/voucher.js';
import Gift from '../models/gift.js';

const timezone = config.get('timezone');

//---------------------------------------------------------------------------------
async function notifyVoucherReissued(voucherId) {
    try {
        const voucher = await Voucher.findById(voucherId).lean();
        if (isEmpty(voucher)) {
            const error = new Error(`Voucher with ID <${voucherId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = voucher.issuedFor;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> for voucher with ID <${voucherId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const expiryDate = moment(voucher.expiryDate).tz(timezone).locale(user.language).format('DD/MM/YYYY');
        const pushTitle = messages[user.language].voucher.reissuedPushTitle;
        const pushBody = messages[user.language].voucher.reissuedPushBody(voucher.code, voucher.value, voucher.percentage, expiryDate);

        const payloadObj = {
            read: false,
            user: userId,
            type: 'generic',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].voucher.reissuedMailSubject,
                text: messages[user.language].voucher.reissuedMailBody(
                    user.username, voucher.code, voucher.value, voucher.percentage, expiryDate,
                ),
                language: user.language,
            },
            push: {
                messages: [{ title: pushTitle, body: pushBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'ServicePoint');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//---------------------------------------------------------------------------------
async function sendSecondaryVoucherForGift6(voucherId) {
    try {
        const voucher = await Voucher.findById(voucherId).lean();
        if (isEmpty(voucher)) {
            const error = new Error(`Voucher with ID <${voucherId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = voucher.issuedFor;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> for voucher with ID <${voucherId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const gift = await Gift.findOne({ user: userId, giftNumber: 6 }).lean();
        if (isEmpty(gift)) {
            const error = new Error(`Gift number 6 for user with ID <${userId}>`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const expiryDate = moment(voucher.expiryDate).tz(timezone).locale(user.language).format('DD/MM/YYYY');
        const minimumAmount = voucher.minimumPrice;
        const voucherCode = voucher.code;
        const { value } = voucher;
        const pushTitle = messages[user.language].gifts.gift6Part2UnlockedPushSubject(value);
        const pushBody = messages[user.language].gifts.gift6Part2UnlockedPushBody(value, voucherCode);
        const emailSubject = messages[user.language].gifts.gift6Part2UnlockedEmailSubject(value);
        const emailBody = messages[user.language].gifts.gift6Part2UnlockedEmailBody(value, voucherCode, expiryDate, minimumAmount);
        const smsBody = messages[user.language].gifts.gift6Part2UnlockedSMSBody(value, voucherCode);

        const payloadObj = {
            read: false,
            user: userId,
            type: 'gift',
            gift: gift._id,
        };

        const notificationMeans = { isEmail: true, isPush: true, isSMS: true };
        const params = {
            email: {
                subject: emailSubject,
                text: emailBody,
                language: user.language,
            },
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

//---------------------------------------------------------------------------------
export {
    notifyVoucherReissued,
    sendSecondaryVoucherForGift6,
};

/**
 * Penalty Notifications
 * @module
 */

import winston from 'winston';

import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';

import Order from '../models/order.js';
import User from '../models/user.js';

/**
 * - sent to user when amount of penalty is applied and deducted from his balance due to
 *   violation of some rules
 * @param {string} userId - id of user penalty applied on
 * @param {number} penaltyAmount - amount of penalty applied
 * @param {'BuyerDidNotShow'|'SellerDidNotDropOff'|'SellerDidNotPayCommission'} penaltyReason - reason for applying the penalty
 * @param {'Order'} objectType - type of object penalty reason is done on
 * @param {string} objectId - id of object penalty reason done on
 * @param {string} link
 * @returns
 */
async function notifyUserPenaltyApplied(userId, penaltyAmount, penaltyReason, objectType, objectId, link) {
    try {
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // assuming for now penalty applied only because of orders
        let object;
        switch (objectType) {
            case 'Order':
            default:
                object = await Order.findById(objectId).select('esId').lean();
        }
        if (isEmpty(object)) {
            const error = new Error(`${objectType} with ID <${objectId}> not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const payloadObj = {
            read: false,
            user: userId,
            type: 'transaction',
            transaction: {
                focusType: user.language === 'en' ? 'Penalty' : 'عقوبة',
                focusId: objectId,
            },
        };

        const notificationMeans = { isPush: true, isEmail: true };
        const params = {
            push: {
                messages: [{
                    title: messages[user.language].penalty.penaltyAppliedPushSubject,
                    body: messages[user.language].penalty.penaltyAppliedPushBody(penaltyAmount),
                }],
                payloads: [payloadObj],
            },
            email: {
                subject: messages[user.language].penalty.penaltyAppliedMailSubject,
                text: messages[user.language].penalty.penaltyAppliedMailBody(user.username, penaltyReason, object.esId, link, penaltyAmount),
                language: user.language,
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'GeneralMandatory');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//----------------------------------------------------------------------------------
/**
 * - sent to user when admin reset the penalty value
 * @param {string} userId
 * @returns
 */
async function notifyUserPenaltyResetByAdmin(userId) {
    try {
        const user = await User.findById(userId).select('language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const payloadObj = {
            read: false,
            user: userId,
            type: 'generic',
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{
                    title: messages[user.language].penalty.penaltyResetPushSubject,
                    body: messages[user.language].penalty.penaltyResetPushBody,
                }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'GeneralMandatory');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyUserPenaltyApplied,
    notifyUserPenaltyResetByAdmin,
};

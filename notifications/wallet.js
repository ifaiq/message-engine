/**
 * Wallet Notifications
 * @module
 */

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import DepositRequest from '../models/depositRequest.js';
import User from '../models/user.js';

/**
 * Notify Wallet Charged, only sent if the deposit request is completed.
 * Email is already sent from PayTabs in case of e-payment.
 *
 * @param {ObjectId} depositRequestId - The deposit Request Id.
 *
 * @returns {Object} {status: String, err?: Error}
 */
async function notifyWalletCharged(depositRequestId) {
    try {
        const depositRequest = await DepositRequest.findById(depositRequestId)
            .select('amount status')
            .populate([{
                path: 'user',
                select: ['language'],
                model: User,
            }]).lean();

        if (isEmpty(depositRequest)) {
            const error = new Error(`DepositRequest with ID <${depositRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        if (depositRequest.status !== 'completed') {
            const error = new Error(`DepositRequest with ID <${depositRequestId}> is <${depositRequest.status}>`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const { user } = depositRequest;
        const userId = user._id;

        const payloadObj = {
            read: false,
            user: userId,
            type: 'coin',
        };

        const pushSubject = messages[user.language].wallet.walletChargedPushSubject;
        const pushBody = messages[user.language].wallet.walletChargedPushBody(depositRequest.amount);
        const pushMessageObj = { title: pushSubject, body: pushBody };

        const notificationMeans = { isPush: true };
        const params = { push: { messages: [pushMessageObj], payloads: [payloadObj] } };

        return sendNotifications(notificationMeans, params, [userId], 'Receipts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export default notifyWalletCharged;

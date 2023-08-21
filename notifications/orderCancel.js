/**
 * Order Cancel Notification
 * @module
 */

/** node modules imports */
import winston from 'winston';
/** models imports */
import Order from '../models/order.js';
import User from '../models/user.js';
/** miscellaneous imports */
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import isValidObjectId from '../misc/isValidObjectId.js';

//--------------------------------------------------------------------------
async function notifyOrderCancelledByAdmin(orderId, reason) {
    try {
        if (!orderId || !isValidObjectId(orderId)) {
            const error = new Error(`Order <${orderId}> is not a valid mongoDB ID`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const order = await Order.findById(orderId).select('esId sellerData buyerData').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // notify seller no need to notify buyer because he is action taker
        const payloadSellerObj = {
            order: orderId,
            read: false,
            user: sellerId,
            type: 'order',
            userType: 'seller',
        };

        const pushSellerSubject = messages[seller.language].order.orderCancelledByAdminPushSubject;
        const pushSellerBody = messages[seller.language].order.orderCancelledByAdminPushBody(order.esId);

        const notificationMeansSeller = { isEmail: true, isPush: true };
        const paramsSeller = {
            email: {
                subject: messages[seller.language].order.orderCancelledByAdminEmailSubject(order.esId),
                text: messages[seller.language].order.orderCancelledByAdminEmailBody(seller.username, order.esId, reason),
                language: seller.language,
            },
            push: {
                messages: [{ title: pushSellerSubject, body: pushSellerBody }],
                payloads: [payloadSellerObj],
            },
        };
        const { sent, err } = await sendNotifications(notificationMeansSeller, paramsSeller, [sellerId], 'MySales');
        if (!sent) return { sent, err };

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const pushBuyerSubject = messages[buyer.language].order.orderCancelledByAdminPushSubject;
        const pushBuyerBody = messages[buyer.language].order.orderCancelledByAdminPushBody(order.esId);

        const payloadBuyerObj = {
            order: orderId,
            read: false,
            user: buyerId,
            type: 'order',
            userType: 'buyer',
        };

        const notificationMeansBuyer = { isEmail: true, isPush: true };
        const paramsBuyer = {
            email: {
                subject: messages[buyer.language].order.orderCancelledByAdminEmailSubject(order.esId),
                text: messages[buyer.language].order.orderCancelledByAdminEmailBody(buyer.username, order.esId, reason),
                language: buyer.language,
            },
            push: {
                messages: [{ title: pushBuyerSubject, body: pushBuyerBody }],
                payloads: [payloadBuyerObj],
            },
        };
        return await sendNotifications(notificationMeansBuyer, paramsBuyer, [buyerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//--------------------------------------------------------------------------
export default notifyOrderCancelledByAdmin;

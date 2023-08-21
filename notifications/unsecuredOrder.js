/**
* Unsecured Order Notifications
* @module
*/
import moment from 'moment-timezone';
import config from 'config';
import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import User from '../models/user.js';
import Order from '../models/order.js';

const timezone = config.get('timezone');

//----------------------------------------------------------------------------------
async function notifyOrderCreated(orderId, buyerOrderLink, sellerOrderLink, postTitle, isAuction) {
    try {
        // get order from orderId
        const order = await Order.findById(orderId, 'buyerData sellerData sellerPaymentPeriodEnd esId').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get buyer
        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId, 'language username').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get seller
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId, 'language username').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerSubject = messages[buyer.language].unsecuredOrder.orderCreatedSubject;
        const sellerSubject = messages[seller.language].unsecuredOrder.orderCreatedSubject;
        const buyerPushBody = messages[buyer.language].unsecuredOrder.orderCreatedPushBodyBuyer(order.esId, isAuction, postTitle);
        const sellerPushBody = messages[seller.language].unsecuredOrder.orderCreatedPushBodySeller;
        const buyerMailBody = messages[buyer.language].unsecuredOrder.orderCreatedMailBodyBuyer(buyer.username, order.esId, buyerOrderLink, isAuction, postTitle);
        const dueDate = moment(order.sellerPaymentPeriodEnd).tz(timezone).locale(seller.language).format('DD/MM/YYYY');
        const dueTime = moment(order.sellerPaymentPeriodEnd).tz(timezone).locale(seller.language).format('hh:mm a');
        const sellerMailBody = messages[seller.language].unsecuredOrder.orderCreatedMailBodySeller(seller.username, order.esId, sellerOrderLink, postTitle, dueDate, dueTime);

        const buyerPayloadObj = {
            read: false,
            user: buyerId,
            type: 'order',
            order: orderId,
            userType: 'buyer',
        };

        const sellerPayloadObj = {
            read: false,
            user: sellerId,
            type: 'commission',
            order: orderId,
            userType: 'seller',
        };

        // push
        // email
        const means = { isEmail: true, isPush: true };
        const buyerParams = {
            email: {
                subject: buyerSubject,
                text: buyerMailBody,
                language: buyer.language,
            },
            push: {
                messages: [{ title: buyerSubject, body: buyerPushBody }],
                payloads: [buyerPayloadObj],
            },
        };
        const sellerParams = {
            email: {
                subject: sellerSubject,
                text: sellerMailBody,
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerSubject, body: sellerPushBody }],
                payloads: [sellerPayloadObj],
            },
        };

        const { sent, err } = await sendNotifications(means, buyerParams, [buyerId], 'MyPurchases');
        if (!sent) winston.error(err);
        return await sendNotifications(means, sellerParams, [sellerId], 'MySales');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//----------------------------------------------------------------------------------
async function notifyOrderCancelled(orderId, buyerOrderLink, sellerOrderLink, cancelledByBuyer = true) {
    try {
        // get order from orderId
        const order = await Order.findById(orderId, 'buyerData sellerData esId').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get buyer
        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId, 'language username').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get seller
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId, 'language username').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerSubject = messages[buyer.language].unsecuredOrder.orderCancelledByBuyerSubject;
        const buyerPushBody = cancelledByBuyer
            ? messages[buyer.language].unsecuredOrder.orderCancelledByBuyerPushBodyBuyer(order.esId)
            : messages[buyer.language].unsecuredOrder.orderCancelledBySellerPushBodyBuyer(order.esId);
        const buyerMailBody = cancelledByBuyer
            ? messages[buyer.language].unsecuredOrder.orderCancelledByBuyerMailBodyBuyer(buyer.username, order.esId, buyerOrderLink)
            : messages[buyer.language].unsecuredOrder.orderCancelledBySellerMailBodyBuyer(buyer.username, order.esId, buyerOrderLink);

        const buyerPayloadObj = {
            read: false,
            user: buyerId,
            type: 'order',
            order: orderId,
            userType: 'buyer',
        };

        // push
        // email
        const means = { isEmail: true, isPush: true };
        // send seller notifications only if cancelled by buyer
        if (cancelledByBuyer) {
            const sellerSubject = messages[seller.language].unsecuredOrder.orderCancelledByBuyerSubject;
            const sellerPushBody = messages[seller.language].unsecuredOrder.orderCancelledByBuyerPushBodySeller(order.esId);
            const sellerMailBody = messages[seller.language].unsecuredOrder.orderCancelledByBuyerMailBodySeller(seller.username, order.esId, sellerOrderLink);

            const sellerPayloadObj = {
                read: false,
                user: sellerId,
                type: 'order',
                order: orderId,
                userType: 'seller',
            };

            const sellerParams = {
                email: {
                    subject: sellerSubject,
                    text: sellerMailBody,
                    language: seller.language,
                },
                push: {
                    messages: [{ title: sellerSubject, body: sellerPushBody }],
                    payloads: [sellerPayloadObj],
                },
            };

            const { sent, err } = await sendNotifications(means, sellerParams, [sellerId], 'MySales');
            if (!sent) winston.error(err);
        }
        const buyerParams = {
            email: {
                subject: buyerSubject,
                text: buyerMailBody,
                language: buyer.language,
            },
            push: {
                messages: [{ title: buyerSubject, body: buyerPushBody }],
                payloads: [buyerPayloadObj],
            },
        };
        return await sendNotifications(means, buyerParams, [buyerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//----------------------------------------------------------------------------------
async function remindSellerToPayCommission(orderId, orderLink, fees) {
    try {
        // get order from orderId
        const order = await Order.findById(orderId, 'sellerData sellerPaymentPeriodEnd status sellerPaymentTime esId').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // if order cancelled don't send notification
        if (order.status === 'Cancelled') {
            winston.debug(`Order #<${orderId}> is cancelled`);
            return { sent: false };
        }
        // if seller already paid don't send notification
        if (order.sellerPaymentTime) {
            winston.debug(`Seller of <${orderId}> already paid`);
            return { sent: false };
        }
        // get seller
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId, 'language username').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const subject = messages[seller.language].unsecuredOrder.paymentReminderSubject;
        const pushBody = messages[seller.language].unsecuredOrder.paymentReminderPushBody(order.esId);
        const dueDate = moment(order.sellerPaymentPeriodEnd).tz(timezone).locale(seller.language).format('DD/MM/YYYY');
        const dueTime = moment(order.sellerPaymentPeriodEnd).tz(timezone).locale(seller.language).format('hh:mm a');
        const mailBody = messages[seller.language].unsecuredOrder.paymentReminderMailBody(seller.username, fees, dueDate, dueTime, order.esId, orderLink);

        const payloadObj = {
            read: false,
            user: sellerId,
            type: 'commission',
            order: orderId,
            userType: 'seller',
        };

        // push
        // email
        const means = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject,
                text: mailBody,
                language: seller.language,
            },
            push: {
                messages: [{ title: subject, body: pushBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(means, params, [sellerId], 'Reminders');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//----------------------------------------------------------------------------------
async function notifySellerDidnotPayCommission(orderId, buyerOrderLink, sellerOrderLink) {
    try {
        // get order from orderId
        const order = await Order.findById(orderId, 'buyerData sellerData esId').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get buyer
        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId, 'language username').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get seller
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId, 'language username').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerSubject = messages[buyer.language].unsecuredOrder.sellerDidnotPaySubject;
        const sellerSubject = messages[seller.language].unsecuredOrder.sellerDidnotPaySubject;
        const buyerPushBody = messages[buyer.language].unsecuredOrder.sellerDidnotPayPushBodyBuyer(order.esId);
        const sellerPushBody = messages[seller.language].unsecuredOrder.sellerDidnotPayPushBodySeller(order.esId);
        const buyerMailBody = messages[buyer.language].unsecuredOrder.sellerDidnotPayMailBodyBuyer(buyer.username, order.esId, buyerOrderLink);
        const sellerMailBody = messages[seller.language].unsecuredOrder.sellerDidnotPayMailBodySeller(seller.username, order.esId, sellerOrderLink);

        const buyerPayloadObj = {
            read: false,
            user: buyerId,
            type: 'order',
            order: orderId,
            userType: 'buyer',
        };

        const sellerPayloadObj = {
            read: false,
            user: sellerId,
            type: 'order',
            order: orderId,
            userType: 'seller',
        };

        // push
        // email
        const means = { isEmail: true, isPush: true };
        const buyerParams = {
            email: {
                subject: buyerSubject,
                text: buyerMailBody,
                language: buyer.language,
            },
            push: {
                messages: [{ title: buyerSubject, body: buyerPushBody }],
                payloads: [buyerPayloadObj],
            },
        };
        const sellerParams = {
            email: {
                subject: sellerSubject,
                text: sellerMailBody,
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerSubject, body: sellerPushBody }],
                payloads: [sellerPayloadObj],
            },
        };

        const { sent, err } = await sendNotifications(means, buyerParams, [buyerId], 'MyPurchases');
        if (!sent) winston.error(err);
        return await sendNotifications(means, sellerParams, [sellerId], 'MySales');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//----------------------------------------------------------------------------------
async function notifySellerPaidCommission(orderId, buyerOrderLink, sellerOrderLink, fees) {
    try {
        // get order from orderId
        const order = await Order.findById(orderId, 'buyerData sellerData esId').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get buyer
        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId, 'language username').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get seller
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId, 'language username').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // seller
        const sellerPushSubject = messages[seller.language].unsecuredOrder.sellerPaymentPushSubjectSeller;
        const sellerMailSubject = messages[seller.language].unsecuredOrder.sellerPaymentMailSubjectSeller;
        const sellerPushBody = messages[seller.language].unsecuredOrder.sellerPaymentPushBodySeller(order.esId);
        const sellerMailBody = messages[seller.language].unsecuredOrder.sellerPaymentMailBodySeller(seller.username, fees, order.esId, sellerOrderLink);

        // buyer
        const buyerPushSubject = messages[buyer.language].unsecuredOrder.sellerPaymentPushSubjectBuyer;
        const buyerMailSubject = messages[buyer.language].unsecuredOrder.sellerPaymentMailSubjectBuyer;
        const buyerPushBody = messages[buyer.language].unsecuredOrder.sellerPaymentPushBodyBuyer(order.esId);
        const buyerMailBody = messages[buyer.language].unsecuredOrder.sellerPaymentMailBodyBuyer(buyer.username, order.esId, buyerOrderLink);

        const buyerPayloadObj = {
            read: false,
            user: buyerId,
            type: 'order',
            order: orderId,
            userType: 'buyer',
        };

        const sellerPayloadObj = {
            read: false,
            user: sellerId,
            type: 'order',
            order: orderId,
            userType: 'seller',
        };

        // push
        // email
        const means = { isEmail: true, isPush: true };
        const buyerParams = {
            email: {
                subject: buyerMailSubject,
                text: buyerMailBody,
                language: buyer.language,
            },
            push: {
                messages: [{ title: buyerPushSubject, body: buyerPushBody }],
                payloads: [buyerPayloadObj],
            },

        };
        const sellerParams = {
            email: {
                subject: sellerMailSubject,
                text: sellerMailBody,
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushSubject, body: sellerPushBody }],
                payloads: [sellerPayloadObj],
            },
        };

        const { sent, err } = await sendNotifications(means, buyerParams, [buyerId], 'MyPurchases');
        if (!sent) winston.error(err);
        return await sendNotifications(means, sellerParams, [sellerId], 'Receipts');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//----------------------------------------------------------------------------------
async function notifyOrderCompleted(orderId) {
    try {
        // get order from orderId
        const order = await Order.findById(orderId, 'buyerData sellerData esId').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get buyer
        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId, 'language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get seller
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId, 'language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerSubject = messages[buyer.language].unsecuredOrder.orderCompletedPushSubject;
        const buyerBody = messages[buyer.language].unsecuredOrder.orderCompletedPushBody(order.esId);
        const sellerSubject = messages[seller.language].unsecuredOrder.orderCompletedPushSubject;
        const sellerBody = messages[seller.language].unsecuredOrder.orderCompletedPushBody(order.esId);

        const buyerPayloadObj = {
            read: false,
            user: buyerId,
            type: 'order',
            order: orderId,
            userType: 'buyer',
        };

        const sellerPayloadObj = {
            read: false,
            user: sellerId,
            type: 'order',
            order: orderId,
            userType: 'seller',
        };

        // push
        const means = { isPush: true };
        const buyerParams = {
            push: {
                messages: [{ title: buyerSubject, body: buyerBody }],
                payloads: [buyerPayloadObj],
            },
        };
        const sellerParams = {
            push: {
                messages: [{ title: sellerSubject, body: sellerBody }],
                payloads: [sellerPayloadObj],
            },
        };

        const { sent, err } = await sendNotifications(means, buyerParams, [buyerId], 'MyPurchases');
        if (!sent) winston.error(err);
        return await sendNotifications(means, sellerParams, [sellerId], 'MySales');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//----------------------------------------------------------------------------------
/**
 * - send email to seller with the buyer's info
 */
async function revealBuyersInfo(orderId, orderLink) {
    try {
        // get order from orderId
        const order = await Order.findById(orderId, 'buyerData sellerData esId').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get buyer
        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId, 'personalData.fullname username phone.number').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        // get seller
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId, 'language username').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const name = (isEmpty(buyer.personalData?.fullname)) ? buyer.username : buyer.personalData.fullname;
        const subject = messages[seller.language].unsecuredOrder.buyerInformationSubject;
        const mailBody = messages[seller.language].unsecuredOrder.buyerInformationMailBody(seller.username, order.esId, name, buyer.phone.number, orderLink);

        // email
        const means = { isEmail: true };

        const sellerParams = {
            email: {
                subject,
                text: mailBody,
                language: seller.language,
            },
        };

        return await sendNotifications(means, sellerParams, [sellerId], 'GeneralMandatory');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyOrderCreated,
    notifyOrderCancelled,
    notifySellerDidnotPayCommission,
    notifySellerPaidCommission,
    notifyOrderCompleted,
    remindSellerToPayCommission,
    revealBuyersInfo,
};

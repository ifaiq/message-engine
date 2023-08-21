/**
 * Order Notifications
 * @module
 */

import config from 'config';
import moment from 'moment-timezone';
import winston from 'winston';

import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';

import Item from '../models/item.js';
import Order from '../models/order.js';
import OrderDetails from '../models/orderDetails.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import UserTransactions from '../models/userTransactions.js';

const timezone = config.get('timezone');

//-------------------------------------------------------------------------
async function notifyUsersAmountUnlocked(orderId) {
    try {
        const order = await Order.findById(orderId).lean();
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

        const sellerPushTitle = messages[seller.language].order.amountUnlockedSellerPushSubject;
        const sellerPushBody = messages[seller.language].order.amountUnlockedSellerPushBody(order.esId);

        const sellerPayloadObj = {
            order: orderId,
            read: false,
            user: sellerId,
            type: 'order',
            userType: 'seller',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].order.amountUnlockedSellerMailSubject,
                text: messages[seller.language].order.amountUnlockedSellerMailBody(seller.username, order.esId),
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                payloads: [sellerPayloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'MyAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifyBuyerSellerDidNotDropOff(orderId) {
    try {
        const order = await Order.findById(orderId).lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
        } else {
            const pushBody = messages[buyer.language].order.sellerDidNotShowBuyerPushBody(order.esId);
            const pushSubject = messages[buyer.language].order.sellerDidNotShowBuyerPushSubject;
            const mailBody = messages[buyer.language].order.sellerDidNotShowBuyerMailBody(buyer.username, order.esId);
            const mailSubject = messages[buyer.language].order.sellerDidNotShowBuyerMailSubject;

            const payloadObj = {
                order: orderId,
                read: false,
                user: buyerId,
                type: 'order',
                userType: 'buyer',
            };

            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: mailSubject,
                    text: mailBody,
                    language: buyer.language,
                },
                push: {
                    messages: [{ title: pushSubject, body: pushBody }],
                    payloads: [payloadObj],
                },
            };
            const { sent, err } = await sendNotifications(notificationMeans, params, [buyerId], 'MyPurchases');
            if (!sent) return { sent, err };
        }

        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const pushBody = messages[seller.language].order.sellerDidNotShowSellerPushBody(order.esId);
        const pushSubject = messages[seller.language].order.sellerDidNotShowSellerPushSubject;
        const mailBody = messages[seller.language].order.sellerDidNotShowSellerMailBody(seller.username, order.esId);
        const mailSubject = messages[seller.language].order.sellerDidNotShowSellerMailSubject;

        const payloadObj = {
            order: orderId,
            read: false,
            user: sellerId,
            type: 'order',
            userType: 'seller',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: mailSubject,
                text: mailBody,
                language: seller.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'GeneralMandatory');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifySellerBuyerDidNotPickUp(orderId, projectXFrontendHost) {
    try {
        const order = await Order.findById(orderId).lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
        } else {
            // PENALIZE BUYER
            const pushBody = messages[buyer.language].order.buyerNoShowBuyerPushBody(order.esId);
            const pushSubject = messages[buyer.language].order.buyerNoShowBuyerPushSubject;

            const payloadObj = {
                order: orderId,
                read: false,
                user: buyerId,
                userType: 'buyer',
                type: 'order',
            };

            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: messages[buyer.language].order.buyerNoShowBuyerMailSubject,
                    text: messages[buyer.language].order.buyerNoShowBuyerMailBody(buyer.username, order.esId),
                    language: buyer.language,
                },
                push: {
                    messages: [{ title: pushSubject, body: pushBody }],
                    payloads: [payloadObj],
                },
            };
            const { sent, err } = await sendNotifications(notificationMeans, params, [buyerId], 'GeneralMandatory');
            if (!sent) return { sent, err };
        }

        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const pushBody = messages[seller.language].order.buyerNoShowSellerPushBody(order.esId);
        const pushSubject = messages[seller.language].order.buyerNoShowSellerPushSubject;

        const link = `${projectXFrontendHost}servicePoint/order/pickUp/seller/${orderId}?lang=${seller.language}`;
        const payloadObj = {
            order: orderId,
            read: false,
            link,
            user: sellerId,
            userType: 'seller',
            type: 'appointment',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].order.buyerNoShowSellerMailSubject,
                text: messages[seller.language].order.buyerNoShowSellerMailBody(seller.username, order.esId, link),
                language: seller.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'MySales');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifyBuyerRejectedItem(orderId, itemId, projectXFrontendHost, window) {
    try {
        const order = await Order.findById(orderId).lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const item = await Item.findById(itemId)
            .populate({
                path: 'post',
                model: Post,
                select: ['esId', 'title'],
            })
            .lean();
        if (isEmpty(item)) {
            const error = new Error(`Item with ID <${itemId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
        } else {
            const buyerPushTitle = messages[buyer.language].order.rejectItemBuyerPushSubject(order.esId);
            const buyerPushBody = messages[buyer.language].order.rejectItemBuyerPushBody(item.post.esId, item.buyerInspection.notes);

            const buyerPayloadObj = {
                order: orderId,
                read: false,
                user: buyerId,
                type: 'order',
                userType: 'buyer',
            };
            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: messages[buyer.language].order.rejectItemBuyerMailSubject(order.esId),
                    text: messages[buyer.language].order.rejectItemBuyerMailBody(buyer.username, item.post.esId, item.post.title, item.buyerInspection.notes),
                    language: buyer.language,
                },
                push: {
                    messages: [{ title: buyerPushTitle, body: buyerPushBody }],
                    payloads: [buyerPayloadObj],
                },
            };
            const { sent, err } = await sendNotifications(notificationMeans, params, [buyerId], 'ServicePoint');
            if (!sent) return { sent, err };
        }

        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const link = `${projectXFrontendHost}servicePoint/order/pickUp/seller/${orderId}?lang=${seller.language}`;
        const sellerPushTitle = messages[seller.language].order.rejectItemSellerPushSubject(order.esId);
        const sellerPushBody = messages[seller.language].order.rejectItemSellerPushBody(item.post.esId, item.buyerInspection.notes);

        const sellerPayloadObj = {
            order: orderId,
            read: false,
            user: sellerId,
            type: 'order',
            userType: 'seller',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].order.rejectItemSellerMailSubject(order.esId),
                text: messages[seller.language].order.rejectItemSellerMailBody(seller.username, item.post.esId, item.post.title, item.buyerInspection.notes, window, link),
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                payloads: [sellerPayloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'ServicePoint');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifyBuyerPickedUpItem(orderId) {
    try {
        const order = await Order.findById(orderId).lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${order.buyerData.buyer}> for order with ID <${orderId}> not found`);
            winston.error(error);
        } else {
            const buyerPushTitle = messages[buyer.language].order.pickUpBuyerPushSubject;
            const buyerPushBody = messages[buyer.language].order.pickUpBuyerPushBody(order.esId);

            const buyerPayloadObj = {
                order: orderId,
                read: false,
                user: buyerId,
                type: 'order',
                userType: 'buyer',
            };
            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: messages[buyer.language].order.pickUpBuyerMailSubject,
                    text: messages[buyer.language].order.pickUpBuyerMailBody(buyer.username, order.esId),
                    language: buyer.language,
                },
                push: {
                    messages: [{ title: buyerPushTitle, body: buyerPushBody }],
                    payloads: [buyerPayloadObj],
                },
            };
            const { sent, err } = await sendNotifications(notificationMeans, params, [buyerId], 'ServicePoint');
            if (!sent) return { sent, err };
        }

        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerPushTitle = messages[seller.language].order.pickupSellerPushSubject;
        const sellerPushBody = messages[seller.language].order.pickupSellerPushBody(order.esId);

        const sellerPayloadObj = {
            order: orderId,
            read: false,
            user: sellerId,
            type: 'order',
            userType: 'seller',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].order.pickupSellerMailSubject,
                text: messages[seller.language].order.pickupSellerMailBody(seller.username, order.esId),
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                payloads: [sellerPayloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'ServicePoint');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifySellerDroppedOffItemSeller(orderId) {
    try {
        const order = await Order.findById(orderId).lean();
        const orderDetails = await OrderDetails.findOne({ order: orderId }).select('cards.quantity cards.price')
            .populate({
                path: 'cards.post',
                model: Post,
                select: ['title'],
            })
            .lean();

        if (isEmpty(order) || isEmpty(orderDetails)) {
            const error = new Error(`Order with ID <${orderId}> not found or order details not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${order.sellerData.seller}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerPushTitle = messages[seller.language].order.dropoffSellerPushSubject(order.esId);
        const sellerPushBody = messages[seller.language].order.dropoffSellerPushBody;

        const sellerPayloadObj = {
            order: orderId,
            read: false,
            user: sellerId,
            type: 'order',
            userType: 'seller',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].order.dropoffSellerMailSubject(order.esId),
                text: messages[seller.language].order.dropoffSellerMailBody(seller.username),
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                payloads: [sellerPayloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'ServicePoint');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifySellerDroppedOffItemBuyer(orderId, projectXFrontendHost, appointmentExists) {
    try {
        const order = await Order.findById(orderId).lean();
        const orderDetails = await OrderDetails.findOne({ order: orderId }).select('cards.quantity cards.price')
            .populate({
                path: 'cards.post',
                model: Post,
                select: ['title'],
            })
            .lean();

        if (isEmpty(order) || isEmpty(orderDetails)) {
            const error = new Error(`Order with ID <${orderId}> not found or order details not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${order.buyerData.buyer}> for order with ID <${orderId}> not found`);
            return { sent: false, err: error };
        }
        let dueAmount;
        const postTitle = [];
        const quantity = [];
        const expiryDate = moment(order.buyerPickUpPeriodEnd).tz(timezone).locale(buyer.language).format('DD/MM/YYYY');
        const expiryTime = moment(order.buyerPickUpPeriodEnd).tz(timezone).locale(buyer.language).format('hh:mm a');
        const creationDate = moment(order.checkOutTime).tz(timezone).locale(buyer.language).format('DD/MM/YYYY');
        const creationTime = moment(order.checkOutTime).tz(timezone).locale(buyer.language).format('hh:mm a');
        orderDetails.cards.forEach((card) => {
            postTitle.push(card.post.title);
            quantity.push(card.quantity);
        });
        const requestValue = order.priceAfterVouchers ? order.priceAfterVouchers : order.soldPrice;
        const userTransactions = await UserTransactions.findOne({ user: order.buyerData.buyer }).select('balance').lean();
        let userBalance = 0;
        if (userTransactions.balance) userBalance = userTransactions.balance;
        // If the amount in the wallet covers the charge of the order, send an alert saying that and
        // return the amount of the wallet. Otherwise send the amount that should be paid by the buyer.
        if (userBalance < requestValue) {
            dueAmount = requestValue - userBalance;
            dueAmount = Math.round((dueAmount + Number.EPSILON) * 100) / 100;
        }

        let buyerPushTitle;
        let buyerPushBody;
        if (appointmentExists) {
            buyerPushTitle = messages[buyer.language].appointment.buyerCanPickUpPushSubject;
            buyerPushBody = messages[buyer.language].appointment.buyerCanPickUpPushBody(order.esId, expiryDate, expiryTime);
        } else {
            buyerPushTitle = messages[buyer.language].appointment.scheduleAppointmentPushSubject(false);
            buyerPushBody = messages[buyer.language].appointment.scheduleAppointmentPushBody('order', order.esId, expiryDate, expiryTime, 'buyer');
        }

        const link = `${projectXFrontendHost}servicePoint/order/pickUp/buyer/${orderId}?lang=${buyer.language}`;
        const buyerPayloadObj = {
            order: orderId,
            read: false,
            link,
            user: buyerId,
            userType: 'buyer',
            type: 'appointment',
        };

        let emailSubject;
        let emailBody;
        if (appointmentExists) {
            emailSubject = messages[buyer.language].appointment.buyerCanPickUpEmailSubject;
            emailBody = messages[buyer.language].appointment.buyerCanPickUpEmailBody(buyer.username, expiryDate, expiryTime, order.esId, link, creationDate, creationTime, postTitle, quantity, requestValue, dueAmount);
        } else {
            emailSubject = messages[buyer.language].appointment.scheduleAppointmentMailSubject(false);
            emailBody = messages[buyer.language].appointment.scheduleAppointmentMailBody(buyer.username, 'buyer', 'pickUp', expiryDate, expiryTime, 'order', order.esId, link, creationDate, creationTime, postTitle, quantity, requestValue, dueAmount);
        }

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: emailSubject,
                text: emailBody,
                language: buyer.language,
            },
            push: {
                messages: [{ title: buyerPushTitle, body: buyerPushBody }],
                payloads: [buyerPayloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [buyerId], 'ServicePoint');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifyChooseSP(orderId, userId, userType, host) {
    try {
        const order = await Order.findById(orderId).lean();
        const orderDetails = await OrderDetails.findOne({ order: orderId }).select('cards.quantity cards.price')
            .populate({
                path: 'cards.post',
                model: Post,
                select: ['title'],
            })
            .lean();

        if (isEmpty(order) || isEmpty(orderDetails)) {
            const error = new Error(`Order with ID <${orderId}> not found or order details not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const link = `${host}servicePoint/order/dropOff/seller/${orderId}?lang=${user.language}`;

        const payloadObj = {
            order: orderId,
            read: false,
            link,
            user: userId,
            userType,
            type: 'appointment',
        };

        const postTitle = [];
        const quantity = [];
        const expiryDate = moment(order.dropOffPeriodEnd).tz(timezone).locale(user.language).format('DD/MM/YYYY');
        const expiryTime = moment(order.dropOffPeriodEnd).tz(timezone).locale(user.language).format('hh:mm a');
        const creationDate = moment(order.checkOutTime).tz(timezone).locale(user.language).format('DD/MM/YYYY');
        const creationTime = moment(order.checkOutTime).tz(timezone).locale(user.language).format('hh:mm a');
        for (let i = 0; i < orderDetails.cards.length; i += 1) {
            const card = orderDetails.cards[i];
            postTitle.push(card.post.title);
            if (userType === 'seller') {
                // in case of seller drop off
                // quantity is obj {order: , notDroppedOff:} where order-> total number of order items/post , notDroppedOff-> number of items needed to be dropped off at sp
                // get items with itemStatus = 'waitingDropOff' and with id in order.items and post = card.post.title
                const notDroppedOff = await Item.find({ status: 'waitingDropOff', post: card.post._id, _id: order.items }).count();
                quantity.push({ order: card.quantity, notDroppedOff });
            } else {
                quantity.push(card.quantity);
            }
        }
        const requestValue = userType === 'buyer' && order.priceAfterVouchers ? order.priceAfterVouchers : order.soldPrice;

        const pushBody = messages[user.language].appointment.scheduleAppointmentPushBody('order', order.esId, expiryDate, expiryTime, 'seller');
        const pushSubject = messages[user.language].appointment.scheduleAppointmentPushSubject(false);

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].appointment.scheduleAppointmentMailSubject(false),
                text: messages[user.language].appointment.scheduleAppointmentMailBody(user.username, 'seller', 'dropOff', expiryDate, expiryTime, 'order', order.esId, link, creationDate, creationTime, postTitle, quantity, requestValue, undefined),
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'MyAppointments');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifyOrderCancelledFromBuyer(orderId) {
    try {
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
        const payloadObj = {
            order: orderId,
            read: false,
            user: sellerId,
            type: 'order',
            userType: 'seller',
        };

        const pushSubject = messages[seller.language].order.orderCancelledSellerPushSubject;
        const pushBody = messages[seller.language].order.orderCancelledSellerPushBody(order.esId);

        const notificationMeansSeller = { isEmail: true, isPush: true };
        const paramsSeller = {
            email: {
                subject: messages[seller.language].order.orderCancelledSellerMailSubject,
                text: messages[seller.language].order.orderCancelledSellerMailBody(seller.username, order.esId),
                language: seller.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
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

        const notificationMeansBuyer = { isEmail: true };
        const paramsBuyer = {
            email: {
                subject: messages[buyer.language].order.orderCancelledBuyerMailSubject,
                text: messages[buyer.language].order.orderCancelledBuyerMailBody(buyer.username),
                language: buyer.language,
            },
        };
        return await sendNotifications(notificationMeansBuyer, paramsBuyer, [buyerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function notifyOrderCancelledAtInspection(orderId) {
    try {
        const order = await Order.findById(orderId).select('esId buyerData').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${order.buyerData.buyer}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            order: orderId,
            read: false,
            user: buyerId,
            userType: 'buyer',
            type: 'order',
        };

        const pushBody = messages[buyer.language].order.orderInspectionErrorPushBody(order.esId);
        const pushSubject = messages[buyer.language].order.orderInspectionErrorPushSubject;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[buyer.language].order.orderInspectionErrorMailSubject(order.esId),
                text: messages[buyer.language].order.orderInspectionErrorMailBody(buyer.username),
                language: buyer.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [buyerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function sendDropOffReceipt(orderId, totalAmount) {
    try {
        const order = await Order.findById(orderId).select('esId sellerData').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username name language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`Seller with ID <${sellerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[seller.language].order.dropOffReceiptMailSubject,
                text: messages[seller.language].order.dropOffReceiptMailBody(seller.username, order.esId, seller.name, totalAmount),
                language: seller.language,
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'Receipts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function sendPickUpReceipt(orderId, totalAmount) {
    try {
        const order = await Order.findById(orderId).select('esId buyerData').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username name language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${order.buyerData.buyer}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[buyer.language].order.pickUpReceiptMailSubject,
                text: messages[buyer.language].order.pickUpReceiptMailBody(buyer.username, order.esId, buyer.name, totalAmount),
                language: buyer.language,
            },
        };
        return await sendNotifications(notificationMeans, params, [buyerId], 'Receipts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function buyNowOrderCreated(orderIds) {
    try {
        if (!Array.isArray(orderIds)) {
            const error = new Error('Wrong type for orderIds, must be an array');
            winston.error(error);
            return { sent: false, err: error };
        }

        if (orderIds.length < 1) {
            const error = new Error('OrderIds array must have at least one element');
            winston.error(error);
            return { sent: false, err: error };
        }

        // get buyer data for the first order; they are all the same
        const order = await Order.findById(orderIds[0]).select('_id buyerData').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderIds[0]}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${order.buyerData.buyer}> for order IDs <${orderIds}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const ordersList = [];
        // check that all order ids are valid ones
        for (let i = 0; i < orderIds.length; i += 1) {
            const orderForList = await Order.findById(orderIds[i]).select('esId').lean();
            if (isEmpty(orderForList)) {
                const error = new Error(`Order with ID <${orderIds[i]}> not found`);
                winston.error(error);
                orderIds.splice(i, 1);
            } else {
                const link = `${config.get('frontend_host')}servicePoint/order/pickUp/buyer/${orderForList._id}?lang=${buyer.language}`;
                ordersList.push({ orderId: orderForList.esId, link });
            }
        }

        const payloadObj = {
            orders: orderIds,
            read: false,
            user: buyerId,
            userType: 'buyer',
            type: 'order', // TODO: make multiple-orders
        };

        const pushBody = messages[buyer.language].order.buyNowOrderCreatedPushBody(orderIds.length);
        const pushSubject = messages[buyer.language].order.buyNowOrderCreatedPushSubject(orderIds.length);
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[buyer.language].order.buyNowOrderCreatedEmailSubject(orderIds.length),
                text: messages[buyer.language].order.buyNowOrderCreatedEmailBody(buyer.username, ordersList),
                language: buyer.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [buyerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function earlyDroppedOffOrderCreated(orderId, orderLink) {
    let creationDate;
    let creationTime;
    const postTitle = [];
    const quantity = [];
    try {
        const order = await Order.findById(orderId).select('sellerData items esId totalPrice checkOutTime').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const sellerId = order.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`seller with ID <${sellerId}> for order IDs <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const orderDetails = await OrderDetails.findOne({ order: orderId }).select('cards.quantity cards.price')
            .populate({
                path: 'cards.post',
                model: Post,
                select: ['title'],
            }).lean();
        if (isEmpty(orderDetails)) {
            const error = new Error(`Order details for order ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        creationDate = moment(order.checkOutTime).tz(timezone).locale(seller.language).format('DD/MM/YYYY');
        creationTime = moment(order.checkOutTime).tz(timezone).locale(seller.language).format('hh:mm a');
        orderDetails.cards.forEach((card) => {
            postTitle.push(card.post.title);
            quantity.push(card.quantity);
        });
        const payloadObj = {
            order: orderId,
            read: false,
            user: sellerId,
            userType: 'seller',
            type: 'order',
        };
        const pushBody = messages[seller.language].order.earlyDroppedOffItemsOrderPushBody;
        const pushSubject = messages[seller.language].order.earlyDroppedOffItemsOrderSubject;
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].order.earlyDroppedOffItemsOrderSubject,
                text: messages[seller.language].order.earlyDroppedOffItemsOrderEmailBody(seller.username,
                    creationDate, creationTime, postTitle, quantity, order.totalPrice, order.esId, orderLink),
                language: seller.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [sellerId], 'MySales');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function orderShipped(orderId, estimatedDeliveryDate) {
    try {
        const order = await Order.findById(orderId).select('esId buyerData paymentMethod priceAfterVouchers soldPrice').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const deliveryDate = moment(estimatedDeliveryDate).tz(timezone).locale(buyer.language).format('DD/MM/YYYY');
        let emailBody = '';
        if (order.paymentMethod === 'CASH') {
            const requestValue = order.priceAfterVouchers ? order.priceAfterVouchers : order.soldPrice;
            const userTransactions = await UserTransactions.findOne({ user: order.buyerData.buyer }).select('balance').lean();
            const userBalance = userTransactions?.balance || 0;

            let dueAmount = 0;
            if (userBalance < requestValue) {
                dueAmount = Number(requestValue) - Number(userBalance);
                dueAmount = Math.round((dueAmount + Number.EPSILON) * 100) / 100;
            }
            emailBody = messages[buyer.language].order.orderShippedCashPaymentEmailBody(buyer.username, order.esId, dueAmount, deliveryDate);
        } else {
            emailBody = messages[buyer.language].order.orderShippedOnlinePaymentEmailBody(buyer.username, order.esId, deliveryDate);
        }

        const payloadObj = {
            order: orderId,
            read: false,
            user: buyerId,
            userType: 'buyer',
            type: 'order',
        };

        const pushBody = messages[buyer.language].order.orderShippedPushBody(order.esId);
        const pushSubject = messages[buyer.language].order.orderShippedPushSubject;
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[buyer.language].order.orderShippedEmailSubject(order.esId),
                text: emailBody,
                language: buyer.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [buyerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
async function orderDelivered(orderId) {
    try {
        const order = await Order.findById(orderId).select('esId buyerData').lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = order.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`Buyer with ID <${buyerId}> for order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            order: orderId,
            read: false,
            user: buyerId,
            userType: 'buyer',
            type: 'order',
        };

        const pushBody = messages[buyer.language].order.orderDeliveredPushBody(order.esId);
        const pushSubject = messages[buyer.language].order.orderDeliveredPushSubject;
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[buyer.language].order.orderDeliveredEmailSubject(order.esId),
                text: messages[buyer.language].order.orderDeliveredEmailBody(buyer.username, order.esId),
                language: buyer.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [buyerId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//-------------------------------------------------------------------------
export {
    notifyUsersAmountUnlocked,
    notifyBuyerSellerDidNotDropOff,
    notifySellerBuyerDidNotPickUp,
    notifyBuyerRejectedItem,
    notifyBuyerPickedUpItem,
    notifySellerDroppedOffItemSeller,
    notifySellerDroppedOffItemBuyer,
    notifyChooseSP,
    notifyOrderCancelledFromBuyer,
    notifyOrderCancelledAtInspection,
    sendDropOffReceipt,
    sendPickUpReceipt,
    buyNowOrderCreated,
    earlyDroppedOffOrderCreated,
    orderShipped,
    orderDelivered,
};

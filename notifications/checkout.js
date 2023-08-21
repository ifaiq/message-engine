/**
* checkout Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Checkout from '../models/checkout.js';
import User from '../models/user.js';
import ShoppingCart from '../models/shoppingCart.js';

async function notifyUserToCompleteBuyNowCheckout(checkoutId) {
    try {
        const checkout = await Checkout.findById(checkoutId).select('user status').lean();
        if (isEmpty(checkout)) {
            winston.error(`Checkout with ID <${checkoutId}> not found`);
            const error = new Error(`Checkout with ID <${checkoutId}> not found`);
            return { sent: false, err: error };
        }
        const userId = checkout.user;
        if (checkout.status !== 'OPEN') {
            winston.error(`Checkout with ID <${checkoutId}> is ${checkout.status}`);
            const error = new Error(`Checkout with ID <${checkoutId}> with status ${checkout.status} is invalid`);
            return { sent: false, err: error };
        }
        const user = await User.findById(userId).select('language username').lean();
        if (isEmpty(user)) {
            winston.error(`User with ID <${userId}> not found`);
            const error = new Error(`User with ID <${userId}> not found`);
            return { sent: false, err: error };
        }

        const cart = await ShoppingCart.findOne({ user: userId }).select('items').lean();
        if (isEmpty(cart)) {
            winston.error(`Shopping Cart for user <${user.username}> not found`);
            const error = new Error(`Shopping Cart for user <${user.username}> not found`);
            return { sent: false, err: error };
        }
        if (isEmpty(cart?.items) || cart?.items?.length === 0) {
            winston.error(`User <${user.username}> has no items in the shopping cart`);
            const error = new Error(`User <${user.username}> has no items in the shopping cart`);
            return { sent: false, err: error };
        }
        const pushSubject = messages[user.language].checkout.completeCheckoutSubject;
        const pushBody = messages[user.language].checkout.completeCheckoutBuyNowBody;
        const payloadObj = {
            read: false,
            user: userId,
            type: 'shoppingCart',
            userType: 'buyer',
        };
        const means = { isPush: true };
        const params = {
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(means, params, [userId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}
async function notifyUserToCompleteAuctionCheckout(checkoutId) {
    try {
        const checkout = await Checkout.findById(checkoutId).select('user status order').lean();
        const userId = checkout.user;
        if (isEmpty(checkout)) {
            winston.error(`Checkout with ID <${checkoutId}> not found`);
            const error = new Error(`Checkout with ID <${checkoutId}> not found`);
            return { sent: false, err: error };
        }
        if (checkout.status !== 'OPEN') {
            winston.error(`Checkout with ID <${checkoutId}> with status ${checkout.status} is not valid`);
            const error = new Error(`Checkout with ID <${checkoutId}> is ${checkout.status}`);
            return { sent: false, err: error };
        }
        const user = await User.findById(userId).select('language').lean();
        if (isEmpty(user)) {
            winston.error(`User with ID <${userId}> not found`);
            const error = new Error(`User with ID <${userId}> not found`);
            return { sent: false, err: error };
        }
        const pushSubject = messages[user.language].checkout.completeCheckoutSubject;
        const pushBody = messages[user.language].checkout.completeCheckoutAuctionBody;
        const payloadObj = {
            read: false,
            user: userId,
            type: 'order',
            order: checkout.order,
            userType: 'buyer',
        };
        const means = { isPush: true };
        const params = {
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(means, params, [userId], 'MyPurchases');
    } catch (error) {
        return { sent: false, err: error };
    }
}
export {
    notifyUserToCompleteBuyNowCheckout,
    notifyUserToCompleteAuctionCheckout,
};

/**
* Feedback Notifications
* @module
*/

import winston from 'winston';
import config from 'config';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import User from '../models/user.js';
import Order from '../models/order.js';
import Review from '../models/review.js';

//----------------------------------------------------------------------------------
async function notifyUserReviewOrder(orderId, revieweeType) {
    try {
        const order = await Order.findById(orderId).lean();
        if (isEmpty(order)) {
            const error = new Error(`Order with ID <${orderId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const oldReview = await Review.findOne({ order: orderId, revieweeType }).lean();
        if (!isEmpty(oldReview)) {
            const error = new Error(`this order <${orderId}> already reviewed`);
            winston.error(error);
            return { sent: false, err: error };
        }
        let reviewerId;
        let reviewer;
        let reviewerType;
        let link;
        const host = config.get('frontend_host');
        // to add reviewee in order to get the username
        if (revieweeType === 'seller') {
            // get buyer
            reviewerId = order.buyerData.buyer;
            reviewer = await User.findById(reviewerId).lean();
            reviewerType = 'buyer';
            link = `${host}servicePoint/order/pickUp/buyer/${orderId}?lang=${reviewer.language}`;
            if (isEmpty(reviewer)) {
                const error = new Error(`Buyer with ID <${reviewerId}> for order with ID <${orderId}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
        } else {
            // get seller
            reviewerId = order.sellerData.seller;
            reviewer = await User.findById(reviewerId).lean();
            reviewerType = 'seller';
            link = `${host}servicePoint/order/dropOff/seller/${orderId}?lang=${reviewer.language}`;
            if (isEmpty(reviewer)) {
                const error = new Error(`Seller with ID <${reviewerId}> for order with ID <${orderId}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
        }
        const pushSubject = messages[reviewer.language].review.reviewPushSubject;
        const pushBody = messages[reviewer.language].review.reviewPushBody(order.esId);
        const mailSubject = messages[reviewer.language].review.reviewMailSubject;
        const mailBody = messages[reviewer.language].review.reviewMailBody(reviewer.username, order.esId, link);
        const reviewerPayloadObj = {
            read: false,
            user: reviewerId,
            type: 'order',
            order: orderId,
            link,
            userType: reviewerType,
        };
        // push
        // email
        const means = { isEmail: true, isPush: true };
        const reviewerParams = {
            email: {
                subject: mailSubject,
                text: mailBody,
                language: reviewer.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [reviewerPayloadObj],
            },
        };
        return await sendNotifications(means, reviewerParams, [reviewerId], 'MyMazadatCommunity');
    } catch (error) {
        return { sent: false, err: error };
    }
}
export default notifyUserReviewOrder;

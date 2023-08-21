/**
* Return Request Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import CommentReview from '../models/commentReview.js';
import ReturnRequest from '../models/returnRequest.js';
import User from '../models/user.js';

async function notifyBuyerDidNotPickup(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData buyerData');
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(userId).lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${userId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[buyer.language].returnRequest.userNoShowPushSubject;
        const body = messages[buyer.language].returnRequest.userNoShowPushBody;

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: userId,
            userType: 'buyer',
            type: 'return',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[buyer.language].returnRequest.userNoShowMailSubject(returnRequest.esId),
                text: messages[buyer.language].returnRequest.userNoShowMailBody(buyer.username),
                language: buyer.language,
            },
            push: {
                messages: [{ title, body }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifySellerDidNotPickup(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData buyerData');
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = returnRequest.sellerData.seller;
        const seller = await User.findById(userId).lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${userId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[seller.language].returnRequest.userNoShowPushSubject;
        const body = messages[seller.language].returnRequest.userNoShowPushBody;

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: userId,
            userType: 'seller',
            type: 'return',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[seller.language].returnRequest.userNoShowMailSubject(returnRequest.esId),
                text: messages[seller.language].returnRequest.userNoShowMailBody(seller.username),
                language: seller.language,
            },
            push: {
                messages: [{ title, body }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyBuyerDidNotDropOff(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId);
        const buyer = await User.findById(returnRequest.buyerData.buyer).lean();
        const seller = await User.findById(returnRequest.sellerData.seller).lean();

        if (!isEmpty(buyer)) {
            const buyerPushTitle = messages[buyer.language].returnRequest.returnRequestCancelledPushSubject;
            const buyerMailTitle = messages[buyer.language].returnRequest.returnRequestCancelledMailSubject(returnRequest.esId);
            const buyerPushBody = messages[buyer.language].returnRequest.buyerDidNotShowBuyerPushBody;
            const buyerMailBody = messages[buyer.language].returnRequest.buyerDidNotShowBuyerMailBody(buyer.username);

            const buyerPayloadObj = {
                returnRequest: returnRequestId,
                read: false,
                user: buyer._id,
                userType: 'buyer',
                type: 'return',
            };

            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: buyerMailTitle,
                    text: buyerMailBody,
                    language: buyer.language,
                },
                push: {
                    messages: [{ title: buyerPushTitle, body: buyerPushBody }],
                    payloads: [buyerPayloadObj],
                },
            };

            const { sent, err } = await sendNotifications(notificationMeans, params, [buyer._id], 'ReturnRequests');
            if (!sent) return { sent, err };
        }

        if (!isEmpty(seller)) {
            const sellerPushTitle = messages[seller.language].returnRequest.returnRequestCancelledPushSubject;
            const sellerMailTitle = messages[seller.language].returnRequest.returnRequestCancelledMailSubject(returnRequest.esId);
            const sellerPushBody = messages[seller.language].returnRequest.buyerDidNotShowSellerPushBody;
            const sellerMailBody = messages[seller.language].returnRequest.buyerDidNotShowSellerMailBody(seller.username);

            const sellerPayloadObj = {
                returnRequest: returnRequestId,
                read: false,
                user: seller._id,
                userType: 'seller',
                type: 'return',
            };

            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: sellerMailTitle,
                    text: sellerMailBody,
                    language: seller.language,
                },
                push: {
                    messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                    payloads: [sellerPayloadObj],
                },
            };

            const { sent, err } = await sendNotifications(notificationMeans, params, [seller._id], 'ReturnRequests');
            if (!sent) return { sent, err };
        }
        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyBuyerDidNotRespond(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId);
        const buyer = await User.findById(returnRequest.buyerData.buyer).lean();
        const seller = await User.findById(returnRequest.sellerData.seller).lean();

        if (!isEmpty(buyer)) {
            const buyerPushTitle = messages[buyer.language].returnRequest.returnRequestCancelledPushSubject;
            const buyerMailTitle = messages[buyer.language].returnRequest.returnRequestCancelledMailSubject(returnRequest.esId);
            const buyerPushBody = messages[buyer.language].returnRequest.buyerDidNotRespondBuyerPushBody;
            const buyerMailBody = messages[buyer.language].returnRequest.buyerDidNotRespondBuyerMailBody(buyer.username);

            const buyerPayloadObj = {
                returnRequest: returnRequestId,
                read: false,
                user: buyer._id,
                userType: 'buyer',
                type: 'return',
            };

            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: buyerMailTitle,
                    text: buyerMailBody,
                    language: buyer.language,
                },
                push: {
                    messages: [{ title: buyerPushTitle, body: buyerPushBody }],
                    payloads: [buyerPayloadObj],
                },
            };

            const { sent, err } = await sendNotifications(notificationMeans, params, [buyer._id], 'ReturnRequests');
            if (!sent) return { sent, err };
        }

        if (!isEmpty(seller)) {
            const sellerPushTitle = messages[seller.language].returnRequest.returnRequestCancelledPushSubject;
            const sellerMailTitle = messages[seller.language].returnRequest.returnRequestCancelledMailSubject(returnRequest.esId);
            const sellerPushBody = messages[seller.language].returnRequest.buyerDidNotRespondSellerPushBody;
            const sellerMailBody = messages[seller.language].returnRequest.buyerDidNotRespondSellerMailBody(seller.username);

            const sellerPayloadObj = {
                returnRequest: returnRequestId,
                read: false,
                user: seller._id,
                userType: 'seller',
                type: 'return',
            };

            const notificationMeans = { isEmail: true, isPush: true };
            const params = {
                email: {
                    subject: sellerMailTitle,
                    text: sellerMailBody,
                    language: seller.language,
                },
                push: {
                    messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                    payloads: [sellerPayloadObj],
                },
            };

            const { sent, err } = await sendNotifications(notificationMeans, params, [seller._id], 'ReturnRequests');
            if (!sent) return { sent, err };
        }
        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifySellerDidNotRespondOrRejected(returnRequestId, isRejected, frontEndHost) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId);
        const userId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(userId).lean();

        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${userId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const link = `${frontEndHost}returnRequest/buyerResponse/${returnRequestId}?lang=${buyer.language}`;
        let notifTitle;
        let notifBody;
        let mailSubject;
        let mailBody;
        if (isRejected) {
            notifTitle = messages[buyer.language].returnRequest.sellerRejectedPushSubject;
            notifBody = messages[buyer.language].returnRequest.sellerRejectedPushBody(returnRequest.esId);
            mailSubject = messages[buyer.language].returnRequest.sellerRejectedMailSubject(returnRequest.esId);
            mailBody = messages[buyer.language].returnRequest.sellerRejectedMailBody(buyer.username, link);
        } else {
            notifTitle = messages[buyer.language].returnRequest.sellerNoResponsePushSubject;
            notifBody = messages[buyer.language].returnRequest.sellerNoResponsePushBody;
            mailSubject = messages[buyer.language].returnRequest.sellerNoResponseMailSubject(returnRequest.esId);
            mailBody = messages[buyer.language].returnRequest.sellerNoResponseMailBody(buyer.username, link);
        }

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: userId,
            userType: 'buyer',
            type: 'return',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: mailSubject,
                text: mailBody,
                language: buyer.language,
            },
            push: {
                messages: [{ title: notifTitle, body: notifBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifySellerToPickUp(returnRequestId, host) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = returnRequest.sellerData.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[user.language].returnRequest.sellerShouldPickUpPushSubject;
        const body = messages[user.language].returnRequest.sellerShouldPickUpPushBody;

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: userId,
            userType: 'seller',
            type: 'return',
        };

        const link = `${host}servicePoint/returnRequest/pickUp/seller/${returnRequestId}?lang=${user.language}`;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].returnRequest.sellerShouldPickUpMailSubject(returnRequest.esId),
                text: messages[user.language].returnRequest.sellerShouldPickUpMailBody(user.username, link),
                language: user.language,
            },
            push: {
                messages: [{ title, body }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function investigationOpened(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData buyerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = returnRequest.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${buyerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerTitle = messages[buyer.language].returnRequest.investigationOpenedPushSubject;
        const buyerBody = messages[buyer.language].returnRequest.investigationOpenedPushBody(returnRequest.esId);

        const sellerTitle = messages[seller.language].returnRequest.investigationOpenedPushSubject;
        const sellerBody = messages[seller.language].returnRequest.investigationOpenedPushBody(returnRequest.esId);

        const buyerPayloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: buyerId,
            userType: 'buyer',
            type: 'return',
        };
        const sellerPayloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: sellerId,
            userType: 'seller',
            type: 'return',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const buyerParams = {
            email: {
                subject: messages[buyer.language].returnRequest.investigationOpenedMailSubject(returnRequest.esId),
                text: messages[buyer.language].returnRequest.investigationOpenedMailBody(buyer.username, returnRequest.esId),
                language: buyer.language,
            },
            push: {
                messages: [{ title: buyerTitle, body: buyerBody }],
                payloads: [buyerPayloadObj],
            },
        };

        const { sent, err } = await sendNotifications(notificationMeans, buyerParams, [buyerId], 'ReturnRequests');
        if (!sent) return { sent, err };

        const sellerParams = {
            email: {
                subject: messages[seller.language].returnRequest.investigationOpenedMailSubject(returnRequest.esId),
                text: messages[seller.language].returnRequest.investigationOpenedMailBody(seller.username, returnRequest.esId),
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerTitle, body: sellerBody }],
                payloads: [sellerPayloadObj],
            },
        };

        return await sendNotifications(notificationMeans, sellerParams, [sellerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function sellerAcceptsItems(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData buyerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = returnRequest.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${buyerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[buyer.language].returnRequest.sellerAcceptsPushSubjectBuyer;
        const body = messages[buyer.language].returnRequest.sellerAcceptsPushBodyBuyer;

        const buyerPayloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: buyerId,
            userType: 'buyer',
            type: 'return',
        };

        const sellerNotificationMeans = { isEmail: true };
        const sellerParams = {
            email: {
                subject: messages[seller.language].returnRequest.sellerAcceptsMailSubjectSeller(returnRequest.esId),
                text: messages[seller.language].returnRequest.sellerAcceptsMailBodySeller(seller.username),
                language: seller.language,
            },
        };

        const { sent, err } = await sendNotifications(sellerNotificationMeans, sellerParams, [sellerId], 'ReturnRequests');
        if (!sent) return { sent, err };

        const buyerNotificationMeans = { isEmail: true, isPush: true };
        const buyerParams = {
            email: {
                subject: messages[buyer.language].returnRequest.sellerAcceptsMailSubjectBuyer(returnRequest.esId),
                text: messages[buyer.language].returnRequest.sellerAcceptsMailBodyBuyer(buyer.username),
                language: buyer.language,
            },
            push: {
                messages: [{ title, body }],
                payloads: [buyerPayloadObj],
            },
        };

        return await sendNotifications(buyerNotificationMeans, buyerParams, [buyerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function buyersFault(returnRequestId, host) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData buyerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = returnRequest.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${buyerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[buyer.language].returnRequest.investigationOutcomePushSubject;
        const body = messages[buyer.language].returnRequest.userFaultPushBody;

        const buyerPayloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: buyerId,
            userType: 'buyer',
            type: 'return',
        };

        const link = `${host}servicePoint/returnRequest/pickUp/buyer/${returnRequestId}?lang=${buyer.language}`;

        const sellerNotificationMeans = { isEmail: true };
        // TODO push: messages[seller.language].returnRequest.buyersFaultPushBodySeller ??????? they don't send a push why is this here?
        const sellerParams = {
            email: {
                subject: messages[seller.language].returnRequest.sellerAcceptsMailSubjectSeller(returnRequest.esId),
                text: messages[seller.language].returnRequest.buyersFaultMailBodySeller(seller.username),
                language: seller.language,
            },
        };

        const { sent, err } = await sendNotifications(sellerNotificationMeans, sellerParams, [sellerId], 'ReturnRequests');
        if (!sent) return { sent, err };

        const buyerNotificationMeans = { isEmail: true, isPush: true };
        const buyerParams = {
            email: {
                subject: messages[buyer.language].returnRequest.investigationOutcomeMailSubject(returnRequest.esId),
                text: messages[buyer.language].returnRequest.buyersFaultMailBodyBuyer(buyer.username, link),
                language: buyer.language,
            },
            push: {
                messages: [{ title, body }],
                payloads: [buyerPayloadObj],
            },
        };

        return await sendNotifications(buyerNotificationMeans, buyerParams, [buyerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function sellersFault(returnRequestId, host) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData buyerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = returnRequest.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${buyerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[seller.language].returnRequest.investigationOutcomePushSubject;
        const body = messages[seller.language].returnRequest.userFaultPushBody;

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: sellerId,
            userType: 'seller',
            type: 'return',
        };

        const link = `${host}servicePoint/returnRequest/pickUp/seller/${returnRequestId}?lang=${seller.language}`;

        const sellerNotificationMeans = { isEmail: true, isPush: true };
        const sellerParams = {
            email: {
                subject: messages[seller.language].returnRequest.investigationOutcomeMailSubject(returnRequest.esId),
                text: messages[seller.language].returnRequest.sellersFaultMailBodySeller(seller.username, link),
                language: seller.language,
            },
            push: {
                messages: [{ title, body }],
                payloads: [payloadObj],
            },
        };

        const { sent, err } = await sendNotifications(sellerNotificationMeans, sellerParams, [sellerId], 'ReturnRequests');
        if (!sent) return { sent, err };

        const buyerNotificationMeans = { isEmail: true };
        // push: messages[buyer.language].returnRequest.sellersFaultPushBodyBuyer ??????? they don't send a push why is this here?
        const buyerParams = {
            email: {
                subject: messages[buyer.language].returnRequest.investigationOutcomeMailSubject(returnRequest.esId),
                text: messages[buyer.language].returnRequest.sellersFaultMailBodyBuyer(buyer.username),
                language: buyer.language,
            },
        };

        return await sendNotifications(buyerNotificationMeans, buyerParams, [buyerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function sellerPicksUp(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId sellerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = returnRequest.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerNotificationMeans = { isEmail: true };
        const sellerParams = {
            email: {
                subject: messages[seller.language].returnRequest.sellerPickupMailSubject(returnRequest.esId),
                text: messages[seller.language].returnRequest.sellerPickupMailBody(seller.username),
                language: seller.language,
            },
        };

        return await sendNotifications(sellerNotificationMeans, sellerParams, [sellerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function buyerPicksUp(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId buyerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${buyerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerNotificationMeans = { isEmail: true };
        // push: messages[buyer.language].returnRequest.sellersFaultPushBodyBuyer ??????? they don't send a push why is this here?
        const buyerParams = {
            email: {
                subject: messages[buyer.language].returnRequest.buyerPickupMailSubject(returnRequest.esId),
                text: messages[buyer.language].returnRequest.buyerPickupMailBody(buyer.username),
                language: buyer.language,
            },
        };

        return await sendNotifications(buyerNotificationMeans, buyerParams, [buyerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function returnRequestCreated(returnRequestId, host) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId reason sellerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = returnRequest.sellerData.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notifTitle = messages[user.language].returnRequest.returnReqCreatedPushSubject;
        const notifBody = messages[user.language].returnRequest.returnReqCreatedPushBody;

        const link = `${host}returnRequest/sellerDecision/${returnRequestId}?lang=${user.language}`;
        const mailSubject = messages[user.language].returnRequest.returnReqCreatedMailSubject(returnRequest.esId);
        const mailBody = messages[user.language].returnRequest.returnReqCreatedMailBody(user.username, returnRequest.reason, link);

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: userId,
            userType: 'seller',
            type: 'return',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: { subject: mailSubject, text: mailBody, language: user.language },
            push: {
                messages: [{ title: notifTitle, body: notifBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function sellerAcceptsReturnRequest(returnRequestId, host) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId buyerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(userId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${userId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notifTitle = messages[buyer.language].returnRequest.sellerAcceptsPushSubject;
        const notifBody = messages[buyer.language].returnRequest.sellerAcceptsPushBody;

        const link = `${host}servicePoint/returnRequest/dropOff/buyer/${returnRequestId}?lang=${buyer.language}`;
        const mailSubject = messages[buyer.language].returnRequest.sellerAcceptsMailSubject(returnRequest.esId);
        const mailBody = messages[buyer.language].returnRequest.sellerAcceptsMailBody(buyer.username, link);

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: userId,
            userType: 'buyer',
            type: 'return',
        };

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: { subject: mailSubject, text: mailBody, language: buyer.language },
            push: {
                messages: [{ title: notifTitle, body: notifBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function investigationRequested(returnRequestId, host) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).select('esId buyerData sellerData').lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${buyerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = returnRequest.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerPushTitle = messages[seller.language].returnRequest.openInvestigationPushSubject;
        const sellerMailTitle = messages[seller.language].returnRequest.openInvestigationMailSubject(returnRequest.esId);
        const sellerPushBody = messages[seller.language].returnRequest.openInvestigationSellerPushBody;
        const sellerMailBody = messages[seller.language].returnRequest.openInvestigationSellerMailBody(seller.username);

        const link = `${host}servicePoint/returnRequest/dropOff/buyer/${returnRequestId}?lang=${buyer.language}`;
        const buyerTitle = messages[buyer.language].returnRequest.openInvestigationMailSubject(returnRequest.esId);
        const buyerBody = messages[buyer.language].returnRequest.openInvestigationBuyerMailBody(buyer.username, link);

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: sellerId,
            userType: 'seller',
            type: 'return',
        };

        const sellerNotificationMeans = { isEmail: true, isPush: true };
        const sellerParams = {
            email: {
                subject: sellerMailTitle,
                text: sellerMailBody,
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                payloads: [payloadObj],
            },
        };

        const { sent, err } = await sendNotifications(sellerNotificationMeans, sellerParams, [sellerId], 'ReturnRequests');
        if (!sent) return { sent, err };

        const buyerNotificationMeans = { isEmail: true };
        const buyerParams = {
            email: {
                subject: buyerTitle,
                text: buyerBody,
                language: buyer.language,
            },
        };

        return await sendNotifications(buyerNotificationMeans, buyerParams, [buyerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function buyerCancelled(returnRequestId) {
    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).lean();
        if (isEmpty(returnRequest)) {
            const error = new Error(`Return Request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const buyerId = returnRequest.buyerData.buyer;
        const buyer = await User.findById(buyerId).select('username language').lean();
        if (isEmpty(buyer)) {
            const error = new Error(`User with ID <${buyerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const sellerId = returnRequest.sellerData.seller;
        const seller = await User.findById(sellerId).select('username language').lean();
        if (isEmpty(seller)) {
            const error = new Error(`User with ID <${sellerId}> for return request with ID <${returnRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const sellerPushTitle = messages[seller.language].returnRequest.returnRequestCancelledPushSubject;
        const sellerMailTitle = messages[seller.language].returnRequest.returnRequestCancelledMailSubject(returnRequest.esId);
        const sellerPushBody = messages[seller.language].returnRequest.returnRequestCancelledSellerPushBody;
        const sellerMailBody = messages[seller.language].returnRequest.returnRequestCancelledSellerMailBody(seller.username);

        const buyerTitle = messages[buyer.language].returnRequest.returnRequestCancelledMailSubject(returnRequest.esId);
        const buyerBody = messages[buyer.language].returnRequest.returnRequestCancelledBuyerMailBody(buyer.username);

        const payloadObj = {
            returnRequest: returnRequestId,
            read: false,
            user: sellerId,
            userType: 'seller',
            type: 'return',
        };

        const sellerNotificationMeans = { isEmail: true, isPush: true };
        const sellerParams = {
            email: {
                subject: sellerMailTitle,
                text: sellerMailBody,
                language: seller.language,
            },
            push: {
                messages: [{ title: sellerPushTitle, body: sellerPushBody }],
                payloads: [payloadObj],
            },
        };

        const { sent, err } = await sendNotifications(sellerNotificationMeans, sellerParams, [sellerId], 'ReturnRequests');
        if (!sent) return { sent, err };

        const buyerNotificationMeans = { isEmail: true };
        const buyerParams = {
            email: {
                subject: buyerTitle,
                text: buyerBody,
                language: buyer.language,
            },
        };

        return await sendNotifications(buyerNotificationMeans, buyerParams, [buyerId], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function commentAccepted(commentReviewId) {
    try {
        const commentReview = await CommentReview.findById(commentReviewId).select('user comment')
            .populate({
                path: 'returnRequest',
                model: ReturnRequest,
                select: ['esId', 'sellerData', 'buyerData'],
            })
            .lean();
        if (isEmpty(commentReview)) {
            const error = new Error(`Comment Review with ID <${commentReviewId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userToNotify = commentReview.user === 'buyer' ? commentReview.returnRequest.sellerData.seller : commentReview.returnRequest.buyerData.buyer;
        const user = await User.findById(userToNotify).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userToNotify}> for comment review with ID <${commentReviewId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[user.language].returnRequest.commentAddedToReturnRequestPushSubject(commentReview.returnRequest.esId);
        const body = messages[user.language].returnRequest.commentAddedToReturnRequestPushBody(commentReview.user, commentReview.comment);

        const userType = commentReview.user === 'buyer' ? 'seller' : 'buyer';
        const payloadObj = {
            returnRequest: commentReview.returnRequest._id,
            read: false,
            user: userToNotify,
            userType,
            type: 'return',
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{ title, body }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userToNotify], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function commentRejected(commentReviewId) {
    try {
        const commentReview = await CommentReview.findById(commentReviewId).select('user')
            .populate({
                path: 'returnRequest',
                model: ReturnRequest,
                select: ['esId', 'sellerData', 'buyerData'],
            })
            .lean();
        if (isEmpty(commentReview)) {
            const error = new Error(`Comment Review with ID <${commentReviewId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userToNotify = commentReview.user === 'seller' ? commentReview.returnRequest.sellerData.seller : commentReview.returnRequest.buyerData.buyer;
        const user = await User.findById(userToNotify).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userToNotify}> for comment review with ID <${commentReviewId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const title = messages[user.language].returnRequest.commentRejectedPushSubject;
        const body = messages[user.language].returnRequest.commentRejectedPushBody(commentReview.returnRequest.esId);

        const payloadObj = {
            returnRequest: commentReview.returnRequest._id,
            read: false,
            user: userToNotify,
            userType: commentReview.user,
            type: 'return',
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{ title, body }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userToNotify], 'ReturnRequests');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyBuyerDidNotPickup,
    notifySellerDidNotPickup,
    notifyBuyerDidNotDropOff,
    notifyBuyerDidNotRespond,
    notifySellerDidNotRespondOrRejected,
    notifySellerToPickUp,
    investigationOpened,
    sellerAcceptsItems,
    buyersFault,
    sellersFault,
    sellerPicksUp,
    buyerPicksUp,
    returnRequestCreated,
    sellerAcceptsReturnRequest,
    investigationRequested,
    buyerCancelled,
    commentAccepted,
    commentRejected,
};

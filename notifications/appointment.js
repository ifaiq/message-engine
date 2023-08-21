/**
* Appointment Notifications
* @module
*/

import config from 'config';
import winston from 'winston';
import moment from 'moment-timezone';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Order from '../models/order.js';
import OrderDetails from '../models/orderDetails.js';
import Post from '../models/post.js';
import ReturnDetails from '../models/returnDetails.js';
import ReturnRequest from '../models/returnRequest.js';
import User from '../models/user.js';
import UserTransactions from '../models/userTransactions.js';
import Appointment from '../models/appointment.js';
import Item from '../models/item.js';

const timezone = config.get('timezone');

function skipRequest(requestKey, requestQuery, userType, actionType, appointmentComingSoon = false) {
    // If the request is an order,
    // and not one of the following cases, then skip the notification:
    // case 1: Seller needs to drop-off a newly created order, but still did not take the appointment (reminder to schedule an appointment), or took the appointment but still did not drop-off (appointment coming soon)
    // case 2: Buyer needs to pick-up the order after seller drop-off, but still did not take the appointment (reminder to schedule an appointment), or took the appointment but still did not pick-up (appointment coming soon)
    // case 3: Seller needs to pick-up the order after buyer no-show or buyer items reject, but still did not take the appointment which is indicated either by the seller not having a timeslot or by having an old timeslot from the drop off
    // but the actionType is not pickUp where actionType becomes pickUp on schedule appointment (reminder to schedule an appointment), or took the appointment but still did not pick-up (appointment coming soon)
    if (requestKey === 'order'
    && !(
        (requestQuery.status === 'Created' && userType === 'seller' && actionType === 'dropOff' && ((!appointmentComingSoon && !requestQuery[`${userType}Data`].timeslot) || (appointmentComingSoon && requestQuery[`${userType}Data`].timeslot && requestQuery.dropOffTime == null)))
        || (requestQuery.status === 'Created' && userType === 'buyer' && actionType === 'pickUp' && requestQuery.dropOffTime != null && ((!appointmentComingSoon && !requestQuery[`${userType}Data`].timeslot) || (appointmentComingSoon && requestQuery[`${userType}Data`].timeslot && requestQuery.pickUpTime == null)))
        || (userType === 'seller' && requestQuery.sellerPickUp && ((!appointmentComingSoon && (!requestQuery[`${userType}Data`].timeslot || requestQuery[`${userType}Data`].actionType !== 'pickUp')) || (appointmentComingSoon && requestQuery[`${userType}Data`].timeslot && requestQuery[`${userType}Data`].actionType === 'pickUp' && requestQuery.sellerPickUpTime == null)))
    )) {
        return true;
    }
    // If the request is a return request,
    // and not one of the following cases, then skip the notification:
    // case 1: Pending drop-off by buyer, but still did not take the appointment (reminder to schedule an appointment), or took the appointment but still did not drop-off (appointment coming soon)
    // case 2: Pending buyer pick-up after investigation, but still did not take the appointment which is indicated either by the buyer not having a timeslot or by having an old timeslot from the drop off
    // but the actionType is not pickUp where actionType becomes pickUp on schedule appointment (reminder to schedule an appointment), or took the appointment but still did not pick-up (appointment coming soon)
    // case 3: Pending seller pick-up, but still did not take the appointment (reminder to schedule an appointment), or took the appointment but still did not pick-up (appointment coming soon)
    // case 4: Pending seller pick-up after investigation, but still did not take the appointment (reminder to schedule an appointment), or took the appointment but still did not pick-up (appointment coming soon)
    if (requestKey === 'returnRequest'
    && !(
        (requestQuery.status === 'PendingDropOff' && userType === 'buyer' && actionType === 'dropOff' && ((!appointmentComingSoon && !requestQuery[`${userType}Data`].timeslot) || (appointmentComingSoon && requestQuery[`${userType}Data`].timeslot && requestQuery.dropOffTime == null)))
        || (requestQuery.status === 'PendingPickUpAfterInvestigation' && requestQuery.investigation && requestQuery.investigation.outcome === 'Buyer Fault' && userType === 'buyer' && ((!appointmentComingSoon && (!requestQuery[`${userType}Data`].timeslot || requestQuery[`${userType}Data`].actionType !== 'pickUp')) || (appointmentComingSoon && requestQuery[`${userType}Data`].timeslot && requestQuery[`${userType}Data`].actionType === 'pickUp' && requestQuery.pickUpTime == null)))
        || (requestQuery.status === 'PendingPickUp' && userType === 'seller' && ((!appointmentComingSoon && !requestQuery[`${userType}Data`].timeslot) || (appointmentComingSoon && requestQuery[`${userType}Data`].timeslot && requestQuery.pickUpTime == null)))
        || (requestQuery.status === 'PendingPickUpAfterInvestigation' && requestQuery.investigation && requestQuery.investigation.outcome === 'Seller Fault' && userType === 'seller' && ((!appointmentComingSoon && !requestQuery[`${userType}Data`].timeslot) || (appointmentComingSoon && requestQuery[`${userType}Data`].timeslot && requestQuery.pickUpTime == null)))
    )) {
        return true;
    }

    // in case of early drop off post items
    // skip notification if :
    // case 1 : post is not available
    // case 2 : all post available quantity is already dropped off at SP
    // case 3 : appointment completed or expired or cancelled
    if (requestKey === 'postDropOff') {
        if (requestQuery.status !== 'available'
    || requestQuery.availableQuantity <= requestQuery.itemsAvailableInSPCount
    || requestQuery.appointmentStatus !== 'created'
        ) { return true; }
    }
    // in case of pick up early dropped off items
    // skip notification if :
    // case 1 : no early dropped off items to pick
    // case 2 : appointment completed or expired or cancelled
    if (requestKey === 'postPickUp') {
        if (requestQuery.itemsAvailableInSPCount === 0 || requestQuery.appointmentStatus !== 'created') {
            return true;
        }
    }

    return false;
}

async function notifyUserToScheduleAppointment(userId, requestId, requestEsId, requestType, requestKey, userType, actionType) {
    try {
        const user = await User.findById(userId, 'username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        let requestQuery;
        let requestDetails;
        const selectOptions = `status dropOffTime items pickUpTime sellerPickUp investigation ${userType}Data.timeslot ${userType}Data.actionType priceAfterVouchers soldPrice checkOutTime dropOffPeriodEnd buyerPickUpPeriodEnd sellerPickUpPeriodEnd itemClaimPeriodEnd quantity reason description createdAt sellerPickUpTime`;

        let error;
        switch (requestKey) {
            case 'order':
                requestQuery = await Order.findById(requestId, selectOptions).lean();
                requestDetails = await OrderDetails.findOne({ order: requestId }).select('cards.quantity cards.price')
                    .populate({
                        path: 'cards.post',
                        model: Post,
                        select: ['title'],
                    })
                    .lean();
                break;
            case 'returnRequest':
                requestQuery = await ReturnRequest.findById(requestId, selectOptions)
                    .populate([{
                        path: 'post',
                        model: Post,
                        select: ['title'],
                    },
                    {
                        path: 'order',
                        model: Order,
                        select: ['esId', 'vouchers'],
                    }])
                    .lean();
                requestDetails = await ReturnDetails.findOne({ returnRequest: requestId }).select('price').lean();
                break;
            default:
                error = new Error(`Unknown request type <${requestKey}>`);
                winston.error(error);
                return { sent: false, err: error };
        }

        if (isEmpty(requestQuery) || isEmpty(requestDetails)) {
            error = new Error(`Request type <${requestKey}> with ID <${requestId}> not found or request details not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (skipRequest(requestKey, requestQuery, userType, actionType)) {
            winston.debug(`Schedule appointment for ${requestKey} with ID <${requestId}> and status <${requestQuery.status}> for <${userType} ${actionType}> skipped`);
            return { sent: true };
        }

        let creationDate;
        let creationTime;
        const postTitle = [];
        const quantity = [];
        let requestValue;
        let dueAmount;
        let expiryDate;
        let expiryTime;

        if (actionType === 'dropOff') {
            expiryDate = moment(requestQuery.dropOffPeriodEnd).tz(timezone).locale(user.language).format('DD/MM/YYYY');
            expiryTime = moment(requestQuery.dropOffPeriodEnd).tz(timezone).locale(user.language).format('hh:mm a');
        } else if (userType === 'seller') {
            expiryDate = moment(requestQuery.sellerPickUpPeriodEnd).tz(timezone).locale(user.language).format('DD/MM/YYYY');
            expiryTime = moment(requestQuery.sellerPickUpPeriodEnd).tz(timezone).locale(user.language).format('hh:mm a');
        } else {
            expiryDate = moment(requestQuery.buyerPickUpPeriodEnd).tz(timezone).locale(user.language).format('DD/MM/YYYY');
            expiryTime = moment(requestQuery.buyerPickUpPeriodEnd).tz(timezone).locale(user.language).format('hh:mm a');
        }

        const link = `${config.get('frontend_host')}${requestKey}/${userType}/${actionType}/${requestId}?lang=${user.language}`;
        if (requestKey === 'order') {
            creationDate = moment(requestQuery.checkOutTime).tz(timezone).locale(user.language).format('DD/MM/YYYY');
            creationTime = moment(requestQuery.checkOutTime).tz(timezone).locale(user.language).format('hh:mm a');
            for (let i = 0; i < requestDetails.cards.length; i += 1) {
                const card = requestDetails.cards[i];
                postTitle.push(card.post.title);
                if (userType === 'seller') {
                    // in case of seller drop off
                    // quantity is obj {order: , notDroppedOff:} where order-> total number of order items/post , notDroppedOff-> number of items needed to be dropped off at sp
                    // get items with itemStatus = 'waitingDropOff' and with id in order.items and post = card.post.title
                    const notDroppedOff = await Item.countDocuments({ status: 'waitingDropOff', post: card.post._id, _id: requestQuery.items }).lean();
                    quantity.push({ order: card.quantity, notDroppedOff });
                } else {
                    quantity.push(card.quantity);
                }
            }
            requestValue = requestQuery.soldPrice;
            if (userType === 'buyer') {
                if (requestQuery.priceAfterVouchers) requestValue = requestQuery.priceAfterVouchers;
                const userTransactions = await UserTransactions.findOne({ user: userId }).select('balance').lean();
                let userBalance = 0;
                if (userTransactions.balance) userBalance = userTransactions.balance;
                // If the amount in the wallet covers the charge of the order, send an alert saying that and
                // return the amount of the wallet. Otherwise send the amount that should be paid by the buyer.
                if (userBalance < requestValue) {
                    dueAmount = requestValue - userBalance;
                    dueAmount = Math.round((dueAmount + Number.EPSILON) * 100) / 100;
                }
            }
        } else {
            creationDate = moment(requestQuery.createdAt).tz(timezone).locale(user.language).format('DD/MM/YYYY');
            creationTime = moment(requestQuery.createdAt).tz(timezone).locale(user.language).format('hh:mm a');
            postTitle.push(requestQuery.post.title);
            quantity.push(requestQuery.quantity);
            requestValue = requestDetails.price * requestQuery.quantity;
            if (userType === 'buyer') {
                if (requestQuery.order.vouchers) {
                    if (requestQuery.order.vouchers.type === 'percentage' && requestQuery.order.vouchers.percentage) {
                        requestValue -= (requestValue * (requestQuery.order.vouchers.percentage / 100));
                    } else if (requestQuery.order.vouchers.type === 'value' && requestQuery.order.vouchers.value) {
                        requestValue -= requestQuery.order.vouchers.value;
                    }
                }
            }
            // Due amount is not needed here
        }

        const pushBody = messages[user.language].appointment.scheduleAppointmentPushBody(requestKey, requestEsId, expiryDate, expiryTime, userType);
        const pushSubject = messages[user.language].appointment.scheduleAppointmentPushSubject(true);
        const mailBody = messages[user.language].appointment.scheduleAppointmentMailBody(user.username, userType, actionType, expiryDate, expiryTime, requestKey, requestEsId, link, creationDate, creationTime, postTitle, quantity, requestValue, dueAmount);
        const mailSubject = messages[user.language].appointment.scheduleAppointmentMailSubject(true);

        const payloadObj = {
            read: false,
            user: userId,
            userType,
            type: requestType,
            actionType,
        };
        payloadObj[requestKey] = requestId;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: mailSubject,
                text: mailBody,
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

async function notifyUserAppointmentComingSoon(userId, requestId, requestEsId, requestType, requestKey, userType, actionType) {
    try {
        const user = await User.findById(userId, 'username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        let requestQuery;
        let error;
        let appointment;
        let notificationKey = requestKey;
        let notificationRequestId = requestId;
        let post;
        const selectOptions = `status dropOffTime pickUpTime sellerPickUp investigation ${userType}Data.timeslot ${userType}Data.actionType priceAfterVouchers soldPrice checkOutTime dropOffPeriodEnd buyerPickUpPeriodEnd sellerPickUpPeriodEnd itemClaimPeriodEnd quantity reason description createdAt sellerPickUpTime`;
        switch (requestKey) {
            case 'order':
                requestQuery = await Order.findById(requestId, selectOptions).lean();
                break;
            case 'returnRequest':
                requestQuery = await ReturnRequest.findById(requestId, selectOptions).lean();
                break;
            case 'postPickUp':
            case 'postDropOff':
                // in case of post appointments , requestId -> appointmentId
                appointment = await Appointment.findById(requestId).lean();
                if (isEmpty(appointment)) {
                    error = new Error(`Appointment for <${requestId}> not found`);
                    winston.error(error);
                    return { sent: false, err: error };
                }
                // get post of this appointment
                post = await Post.findById(appointment.actionId).select('status availableQuantity').lean();
                requestQuery = {
                    requestId, sellerData: { timeslot: appointment.timeslot }, status: post.status, availableQuantity: post.availableQuantity, appointmentStatus: appointment.status,
                };
                requestQuery.itemsAvailableInSPCount = await Item.countDocuments({ post: post._id, status: 'availableInSP' }).lean();
                notificationKey = 'post';
                notificationRequestId = appointment.actionId;
                break;
            default:
                error = new Error(`Unknown request type <${requestKey}>`);
                winston.error(error);
                return { sent: false, err: error };
        }

        if (!requestQuery) {
            error = new Error(`Request type <${requestKey}> with ID <${notificationRequestId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        if (skipRequest(requestKey, requestQuery, userType, actionType, true)) {
            winston.debug(`Appointment coming soon for ${requestKey} with ID <${notificationRequestId}> and status <${requestQuery.status}> for <${userType} ${actionType}> skipped`);
            return { sent: true };
        }

        let dueAmount;
        if (requestKey === 'order' && userType === 'buyer') {
            const userTransactions = await UserTransactions.findOne({ user: userId }).select('balance').lean();
            let userBalance = 0;
            if (userTransactions.balance) userBalance = userTransactions.balance;
            // If the amount in the wallet covers the charge of the order, send an alert saying that and
            // return the amount of the wallet. Otherwise send the amount that should be paid by the buyer.
            const requestValue = requestQuery.priceAfterVouchers ? requestQuery.priceAfterVouchers : requestQuery.soldPrice;
            if (userBalance < requestValue) {
                dueAmount = requestValue - userBalance;
                dueAmount = Math.round((dueAmount + Number.EPSILON) * 100) / 100;
            }
        }
        const pushBody = messages[user.language].appointment.appointmentComingSoonPushBody(moment(requestQuery[`${userType}Data`].timeslot).tz(timezone).locale(user.language).format('DD/MM/YYYY'), moment(requestQuery[`${userType}Data`].timeslot).tz(timezone).locale(user.language).format('hh:mm a'), requestKey, requestEsId, userType);
        const pushSubject = messages[user.language].appointment.appointmentComingSoonPushSubject;
        const mailBody = messages[user.language].appointment.appointmentComingSoonMailBody(user.username, moment(requestQuery[`${userType}Data`].timeslot).tz(timezone).locale(user.language).format('DD/MM/YYYY'), moment(requestQuery[`${userType}Data`].timeslot).tz(timezone).locale(user.language).format('hh:mm a'), requestKey, requestEsId, userType, dueAmount);
        const mailSubject = messages[user.language].appointment.appointmentComingSoonMailSubject;

        const payloadObj = {
            read: false,
            user: userId,
            userType,
            type: requestType,
            actionType,
        };
        payloadObj[notificationKey] = notificationRequestId;
        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: mailSubject,
                text: mailBody,
                language: user.language,
            },
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'Reminders');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyUserToScheduleAppointment,
    notifyUserAppointmentComingSoon,
};

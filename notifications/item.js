/**
 * Item Notifications
 * @module
 */
import config from 'config';
import winston from 'winston';
import moment from 'moment-timezone';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import Appointment from '../models/appointment.js';

const timezone = config.get('timezone');

//----------------------------------------------------------------------------------
async function notifySellerDroppedOffItemsEarly(postId, numberOfItems) {
    try {
        const post = await Post.findById(postId).select('esId').populate({
            path: 'seller',
            model: User,
            select: 'language',
        }).lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const { seller } = post;
        if (isEmpty(seller)) {
            const error = new Error(`Seller for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const payloadObj = {
            read: false,
            post: postId,
            user: seller._id,
            type: 'post',
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{
                    title: messages[seller.language].item.earlyDropOffPushTitle,
                    body: messages[seller.language].item.earlyDropOffPushBody(post.esId, numberOfItems),
                }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [seller._id], 'ServicePoint');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//----------------------------------------------------------------------------------
async function notifySellerPickedUpEarlyDroppedOffItems(postId, numberOfItems) {
    try {
        const post = await Post.findById(postId).select('esId').populate({
            path: 'seller',
            model: User,
            select: 'language',
        }).lean();
        if (isEmpty(post)) {
            const error = new Error(`Post with ID <${postId}> not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const { seller } = post;
        if (isEmpty(seller)) {
            const error = new Error(`Seller for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const payloadObj = {
            read: false,
            post: postId,
            user: seller._id,
            type: 'post',
        };

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{
                    title: messages[seller.language].item.pickUpEarlyDropOffPushTitle,
                    body: messages[seller.language].item.pickUpEarlyDropOffPushBody(post.esId, numberOfItems),
                }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [seller._id], 'ServicePoint');
    } catch (error) {
        return { sent: false, err: error };
    }
}
//----------------------------------------------------------------------------------
/**
 * - user cancelled appointment (push notification is sent)
 * - drop off appointment cancelled because post no longer available (push and email with reason)
 * - pick up or drop off cancelled because order created on post items (push and email with reason)
 * @param {string} appointmentId
 * @param {boolean} orderCreated
 * @param {boolean} cancelledBySeller
 * @returns
 */
async function notifyEarlyDropOffAppointmentCancelled(appointmentId, orderCreated = true, cancelledBySeller = false) {
    try {
        // get the name and language of the appointment user
        // get the title of the post the action created at
        const appointment = await Appointment.findById(appointmentId)
            .populate({
                path: 'user',
                model: User,
                select: 'name username language',
            })
            .populate({
                path: 'actionId',
                model: Post,
                select: 'title',
                as: 'post',
            })
            .lean();
        if (isEmpty(appointment)) {
            const error = new Error(`Appointment with ID <${appointmentId}> not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const { user, timeslot } = appointment;
        const post = appointment.actionId;
        if (isEmpty(user)) {
            const error = new Error(`User for appointment with ID <${appointmentId}>  is not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (isEmpty(post)) {
            const error = new Error(`Post for appointment with ID <${appointmentId}>  is not found.`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const appointmentDate = moment(timeslot).tz(timezone).locale(user.language).format('DD/MM/YYYY');
        const appointmentTime = moment(timeslot).tz(timezone).locale(user.language).format('hh:mm a');

        const payloadObj = {
            read: false,
            post: post._id,
            user: user._id,
            type: 'appointment',
        };

        // send email in case the appointment is not cancelled by seller
        const notificationMeans = { isPush: true, isEmail: !cancelledBySeller };
        const params = {
            push: {
                messages: [{
                    title: messages[user.language].item.cancelledAppointmentPushTitle,
                    body: messages[user.language].item.cancelledAppointmentPushBody(post.title, appointment.actionType),
                }],
                payloads: [payloadObj],
            },
            email: {
                subject: messages[user.language].item.cancelledAppointmentMailSubject,
                text: messages[user.language].item.cancelledAppointmentMailBody(user.name ? user.name : user.username, appointmentDate, appointmentTime, post.title, appointment.actionType, orderCreated),
                language: user.language,
            },
        };
        return await sendNotifications(notificationMeans, params, [user._id], 'MyAppointments');
    } catch (error) {
        return { sent: false, err: error };
    }
}

//----------------------------------------------------------------------------------
export {
    notifySellerDroppedOffItemsEarly,
    notifySellerPickedUpEarlyDroppedOffItems,
    notifyEarlyDropOffAppointmentCancelled,
};

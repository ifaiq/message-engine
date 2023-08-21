/**
* Multi Service Points Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Appointment from '../models/appointment.js';
import User from '../models/user.js';
import Post from '../models/post.js';
import ServicePoint from '../models/ServicePoint.js';

//----------------------------------------------------------------------------------
async function notifySellerPostReady(postId) {
    try {
        const post = await Post.findById(postId).select('esId seller')
            .lean();
        if (isEmpty(post)) {
            winston.error(`Post with ID <${postId}> not found`);
            const error = new Error(`Post with ID <${postId}> not found`);
            return { sent: false, err: error };
        }
        const seller = await User.findById(post.seller).select('language').lean();
        if (isEmpty(seller)) {
            winston.error(`Seller of post with ID <${postId}> not found`);
            const error = new Error(`Seller of post with ID <${postId}> not found`);
            return { sent: false, err: error };
        }
        // get seller appointment to pick up post items
        const appointment = await Appointment.findOne({
            status: 'created', action: 'Post', actionType: 'pickUp', actionId: postId,
        }).select('SP')
            .populate({
                path: 'SP',
                model: ServicePoint,
                select: ['name'],
            }).lean();
        if (isEmpty(appointment)) {
            winston.error(`Appointment to pick up post with ID <${postId}> not found`);
            const error = new Error(`Appointment to pick up post with ID <${postId}> not found`);
            return { sent: false, err: error };
        }
        const pushSubject = messages[seller.language].multiSP.postItemsReadyTitle;
        const pushBody = messages[seller.language].multiSP.postItemsReadyBody(post.esId, appointment.SP?.name);
        const payloadObj = {
            read: false,
            user: seller._id,
            type: 'post',
            post: postId,
        };
        const means = { isPush: true };
        const params = {
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(means, params, [seller._id], 'MySales');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifySellerPostReady,
};

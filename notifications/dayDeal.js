/**
* Day Deal Notifications
* @module
*/

import config from 'config';
import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import { pushNotificationToTopic } from '../misc/mobileNotifications.js';
import DayDeal from '../models/dayDeal.js';
import Notification from '../models/notification.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import UserTokens from '../models/userTokens.js';
import topics from '../models/bull-config/topics.js';

const storageHost = config.get('storage_host');
const thumbnailsContainerName = config.get('dayDeal.thumbnailsContainerName');
const storageLink = `${storageHost}${thumbnailsContainerName}/`;

async function notifyUsersDayDealStarting(dayDealId) {
    const dayDeal = await DayDeal.findById(dayDealId)
        .populate({
            path: 'post',
            model: Post,
            select: ['_id', 'title', 'thumbnail'],
        })
        .lean();
    if (isEmpty(dayDeal) || !dayDeal.post) {
        const error = new Error(`Day deal with ID <${dayDealId}> not found or post with ID <${dayDeal.post._id}> not found`);
        winston.error(error);
        return { sent: false, err: error };
    }

    const topic = topics.dayDeal.starting;
    const users = await UserTokens.find({ topics: { $regex: topic.all, $options: 'i' } })
        .select('topics')
        .populate({
            path: 'user',
            model: User,
            select: ['language'],
        }).lean();

    const payloadObj = {
        read: false,
        type: 'bid',
        post: dayDeal.post._id,
    };

    const pushBody = {
        en: messages.en.dayDeal.dayDealStartPushBody(dayDeal.post.title),
        ar: messages.ar.dayDeal.dayDealStartPushBody(dayDeal.post.title),
    };
    const pushSubject = {
        en: messages.en.dayDeal.dayDealStartPushSubject,
        ar: messages.ar.dayDeal.dayDealStartPushSubject,
    };

    for (let i = 0; i < users.length; i += 1) {
        try {
            const payload = new Notification(payloadObj);
            payload.user = users[i].user._id;
            payload.body = pushBody[users[i].user.language];
            payload.title = pushSubject[users[i].user.language];
            try {
                await payload.save();
            } catch (error) {
                winston.error(`Something went wrong when saving the day deal started payload for user <${users[i].user._id}>`);
            }
        } catch (error) {
            winston.error('Something went wrong when creating the day deal started payload for a user');
        }
    }

    const image = `${storageLink}${dayDeal.post.thumbnail}`;

    await pushNotificationToTopic(
        { title: pushSubject.en, body: pushBody.en, image },
        payloadObj,
        topic.en,
    );
    await pushNotificationToTopic(
        { title: pushSubject.ar, body: pushBody.ar, image },
        payloadObj,
        topic.ar,
    );

    return { sent: true };
}

export default notifyUsersDayDealStarting;

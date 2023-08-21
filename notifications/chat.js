/**
 * Chat Notifications
 * @module
 */

import moment from 'moment';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';

/**
 * notification that sent to the user when someone sends a message in the chat between them
 * @param {String} senderId        sender ID.
 * @param {String} recipientId     recipient ID.
 * @param {String} [message]       the message sent to the user.
 * @param {String} [link]            link of the image sent in the chat.
 * @param {'text' | 'video' | 'image' | 'audio' | 'file'} type            type of the message sent.
 * @returns boolean sent
 */
async function sendChatNotification(senderId, recipientId, message, link, type) {
    try {
        const sender = await User.findById(senderId).select('username').lean();
        if (isEmpty(sender)) {
            const error = new Error(`user with id <${senderId}> is not found`);
            return { sent: false, err: error };
        }
        const recipient = await User.findById(recipientId).select('language').lean();
        if (isEmpty(sender)) {
            const error = new Error(`user with id <${senderId}> is not found`);
            return { sent: false, err: error };
        }
        const oldNotification = await Notification.findOne({
            type: 'chat',
            user: recipientId,
            senderId,
        });
        if (type === 'text' && isEmpty(message)) {
            const error = new Error('Message Cant be null and type is text');
            return { sent: false, err: error };
        }
        let firstTime = 'true';
        if (!isEmpty(oldNotification)) {
            oldNotification.createdAt = moment().toDate();
            oldNotification.updatedAt = moment().toDate();
            oldNotification.read = false;
            oldNotification.seen = false;
            await oldNotification.save();
            firstTime = 'false';
        }
        const pushTitle = messages[recipient.language].chat.messageSentTitle;
        const pushBody = {
            text: messages[recipient.language].chat.textBody(sender.username, message),
            audio: messages[recipient.language].chat.voiceBody(sender.username),
            image: messages[recipient.language].chat.imageBody(sender.username),
            video: messages[recipient.language].chat.videoBody(sender.username),
            file: messages[recipient.language].chat.fileBody(sender.username),
        };
        const notificationMeans = { isPush: true };
        const payloadObj = {
            read: false,
            user: recipientId,
            type: 'chat',
            chatPushType: type,
            firstTime,
            senderId,
            title: pushTitle,
            body: messages[recipient.language].chat.generalChatBody(sender.username),
        };
        const params = {
            push: {
                messages: [{ title: pushTitle, body: pushBody[type], image: link }],
                payloads: [payloadObj],
            },
        };
        return await sendNotifications(notificationMeans, params, [recipientId], 'MyAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export default sendChatNotification;

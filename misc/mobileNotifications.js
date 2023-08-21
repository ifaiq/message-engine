/**
* Mobile Notifications misc
* @module
*/

import winston from 'winston';
import config from 'config';
import { Expo } from 'expo-server-sdk';
import admin from 'firebase-admin';
import isEmpty from './isEmpty.js';

const expo = new Expo();
const credentials = config.get('firebaseCredentials');

admin.initializeApp({
    credential: admin.credential.cert({
        project_id: credentials.project_id,
        private_key: credentials.firebaseKey.replace(/\\n/g, '\n'),
        client_email: credentials.client_email,
    }),
});

// TODO hosny and karim complete the docs
/**
 *
 * @param {object[]} [messageArrayParam] - [ {notification: {title: string, body: string, image: string}, android: {notification: {sound: string}}, apns: {payload: {aps: {sound: string}}}, data: { withSome: {Notification}}, token: string}]
 */
const pushNotification = async (messageArrayParam) => {
    if (isEmpty(messageArrayParam)) return { sent: false };

    const messageArray = messageArrayParam;
    const expoMessageArray = [];
    const firebaseMessageArray = [];

    for (let i = 0; i < messageArray.length; i += 1) {
        if (Expo.isExpoPushToken(messageArray[i].token)) {
            expoMessageArray.push({
                to: messageArray[i].token,
                sound: 'default',
                body: messageArray[i].notification.body,
                title: messageArray[i].notification.title,
                data: { withSome: JSON.parse(messageArray[i].data.withSome) },
            });
        } else {
            messageArray[i].notification.image = messageArray[i].notification.image
                ? messageArray[i].notification.image.slice(0, -1) : undefined;
            firebaseMessageArray.push(messageArray[i]);
        }
    }

    // EXPO
    const chunks = expo.chunkPushNotifications(expoMessageArray);
    for (let i = 0; i < chunks.length; i += 1) {
        const chunk = chunks[i];
        try {
            const sent = await expo.sendPushNotificationsAsync(chunk);
            if (!sent.every((ticket) => ticket.status === 'ok')) {
                winston.error('EXPO: One or more push notifications in the chunk failed to be sent', sent);
            }
        } catch (error) {
            winston.error(`EXPO: Something went wrong with push chunk notification. Error: ${error}`, error);
            // Continue sending other chunks
        }
    }

    // FIREBASE
    while (firebaseMessageArray.length > 0) {
        const chunk = firebaseMessageArray.splice(0, 500); // Maximum number of messages in a single API call
        const response = await admin.messaging().sendAll(chunk);
        winston.debug(`FIREBASE: ${response.successCount} messages were sent successfully`);
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push({ payload: chunk[idx], error: resp.error });
                }
            });
            winston.error(`FIREBASE: Error in sending push notifications. ${response.failureCount} messages failed to be sent. List of messages that caused failures.`, failedTokens);
        }
    }
    return { sent: true };
};

// TODO hosny and karim complete the docs
/**
 *
 * @param {object} [message]
 * @param {string} message.title
 * @param {string} message.body
 * @param {number} message.priority
 * @param {string} message.collapse_key
 * @param {string} message.image
 * @param {object} [payload]
 * @param {boolean} payload.read
 * @param {'watchlist' | 'generic' | 'userProfile' | 'shoppingCart' | 'shareableLink' | 'return' | 'question'
 *         | 'special' | 'order' | 'post' | 'coin' | 'bid' | 'appointment' | 'gift'} payload.type
 * @param {string} [payload.user] - id of user
 * @param {'buyer' | 'seller'} [payload.userType]
 * @param {string} [payload.order] - id of order
 * @param {'pickUp' | 'dropoff'} [payload.actionType]
 * @param {string} [payload.post] - id of post
 * @param {string} [payload.avatar]
 * @param {string} [payload.gift] - id of gift
 * @param {string} [payload.link]
 * @param {string} [payload.returnRequest] - id of returnRequest
 * @param {string} [payload.question] - id of question
 * @param {string} [payload.promotionalPost] - id of post
 * @param {string} [topic]
 * @returns
 */
async function pushNotificationToTopic(message, payload, topic) {
    if (isEmpty(topic)) return { sent: false };
    const msg = {
        topic,
        notification: {
            title: message.title,
            body: message.body,
            image: message.image ? message.image.slice(0, -1) : undefined,
        },
        android: {
            priority: message.priority,
            notification: {
                sound: 'default',
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: 'default',
                },
            },
        },
        data: payload ? { withSome: JSON.stringify(payload) } : undefined,
    };

    if (message.collapse_key) {
        msg.apns.headers = {};
        msg.apns.headers['apns-collapse-id'] = message.collapse_key;
        msg.android.collapse_key = message.collapse_key;
        msg.android.notification.tag = message.collapse_key;
    }

    const res = await admin.messaging().send(msg)
        .then((response) => {
            // Response is a message ID string.
            winston.debug(`FIREBASE: Successfully sent push notification to topic ${topic}. Message: ${response}`, response);
            return { sent: true };
        })
        .catch((error) => {
            winston.error(`FIREBASE: Error sending push notification to topic ${topic}. Message: ${error}`, error);
            return { sent: false, err: error };
        });
    return res;
}

export {
    pushNotification,
    pushNotificationToTopic,
};

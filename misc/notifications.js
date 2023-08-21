/**
 * Notifications misc
 * @module
 */

import winston from 'winston';

import Notification from '../models/notification.js';
import NotificationType from '../models/notificationType.js';
import User from '../models/user.js';
import UserTokens from '../models/userTokens.js';

import equalObjectIds from './equalObjectIds.js';
import isEmpty from './isEmpty.js';
import {
    pushNotification,
} from './mobileNotifications.js';
import sendEmail from './sendEmail.js';
import sendSMS from './sendSMS.js';

//------------------------------------------------------------------------------
/**
 * Decides whether the user with userTokens should receive a notification through
 * sms, email or push and belongs to notification category notificationType.
 * If no notificationType was given, then the notification should be sent by default.
 *
 * @param   {NotificationType}  notificationType - The notification type the notification belongs to.
 * @param   {UserTokens}        userTokens - The user tokens needed to check for user preferences.
 *
 * @returns {Object} {email: Boolean, push: Boolean, sms: Boolean} Whether the notification should be sent,
 *                   if there's a force to default or the user has not chosen a preference, the default is
 *                   returned, otherwise the user's preference is returned.
 */
function shouldSendNotification(notificationType, userTokens) {
    const shouldSend = { email: true, push: true, sms: true };
    if (isEmpty(notificationType)) return shouldSend;

    const { defaultPreferences } = notificationType;

    if (isEmpty(userTokens) || isEmpty(userTokens.notificationTypesChoices)) return defaultPreferences;

    const userChoices = userTokens.notificationTypesChoices.find(
        (element) => equalObjectIds(element.notificationType, notificationType._id),
    );

    if (isEmpty(userChoices) || isEmpty(userChoices.choice)) return defaultPreferences;

    const means = ['email', 'push', 'sms'];
    for (let meanIndex = 0; meanIndex < means.length; meanIndex += 1) {
        const mean = means[meanIndex];
        shouldSend[mean] = (notificationType.forceDefault[mean]
            || userChoices.choice[mean] == null)
            ? defaultPreferences[mean] : userChoices.choice[mean];
    }
    return shouldSend;
}

//------------------------------------------------------------------------------
/**
 * A generic send notification function to send email, push or sms notification or a combination of them,
 * with a middleware for user and system preferences of whether to send the notification or not.
 *
 * @param {object} notificationMeans - The mean of notification to be sent, at least one of {isEmail, isPush, isSMS} has to be set to `true`.
 * @param {boolean} [notificationMeans.isEmail] - The flag is set to `true` if Email notification is to be sent,
 *                                                if the flag is set, params.email is required.
 * @param {boolean} [notificationMeans.isPush] - The flag is set to `true` if Push notification is to be sent,
 *                                               if the flag is set, params.push is required.
 * @param {boolean} [notificationMeans.isSMS] - The flag is set to `true` if SMS notification is to be sent,
 *                                              if the flag is set, params.sms is required.
 *
 * @param {object} params - The email data, {email, push, sms} is required according to notificationMeans.
 * @param {object} [params.email] - Email data to be sent, the data is passed to {@link sendEmail},
 *                                  the same email is sent to all eligible userIds.
 * @param {object} [params.email.extraRecipients] - Extra Recipient emails in {cc: string, bb: string}.
 * @param {string} params.email.subject - The subject of the email.
 * @param {string} params.email.text - The body of the email.
 * @param {string} [params.email.language] - The language of the email template to be used.
 *
 * @param {object} [params.push] - Push message data to be sent, the data is passed to {@link pushNotification},
 *                                 {messages, payloads} must have the same length as userIds, since userIds[index]
 *                                 receives the push message messages[index] and has the payloads[index].
 * @param {object[]} params.push.messages - The push messages. Check {@link pushNotification} for input type.
 * @param {object[]} params.push.payloads - The payload of the messages. Check {@link pushNotification} for input type.
 *
 * @param {object} [params.sms] - SMS message to be sent, the data is passed to {@link sendSMS},
 *                                the same message is sent to all eligible userIds using the same service.
 * @param {string} params.sms.message - The sms message.
 * @param {string} [params.sms.service] - The service to be used. Check {@link sendSMS} for possible values.
 *
 * @param {string[]} userIds - Array of userIds to send the notification to.
 *
 * @param {string} [notificationTypeName] - The name of the {@link NotificationType}, to filter eligible userIds.
 *                                        Check {@link NotificationType NotificationType.name} for possible values,
 *                                        if not given -or is not one of the possible value- the notification will be sent.
 * @returns {object} `{sent: true} | {sent: false, err: Error}`
 */
const sendNotifications = async (
    { isEmail, isPush, isSMS }, // notificationMeans
    { email, push, sms }, // params
    userIds,
    notificationTypeName,
    isBanRelatedNotification = false,
    isImportant = false,
) => {
    if (!isEmail && !isPush && !isSMS) {
        const error = new Error('At least one mean of notification must be true.');
        winston.error(error);
        return { sent: false, err: error };
    }

    if (isEmpty(userIds)) {
        const error = new Error('No users given!');
        winston.verbose(error);
        return { sent: true };
    }

    let extraRecipients;
    let subject;
    let text;
    let language; // email
    let messages;
    let payloads; // push;
    let message;
    let service; // sms

    if (isEmail) {
        if (isEmpty(email)) {
            const error = new Error('If isEmail is selected, then params.email should be given.');
            winston.error(error);
            return { sent: false, err: error };
        }
        ({
            extraRecipients, subject, text, language,
        } = email);
        if (isEmpty(subject) || isEmpty(text)) {
            const error = new Error('params.email.subject&text should be given.');
            winston.error(error);
            return { sent: false, err: error };
        }
    }
    if (isPush) {
        if (isEmpty(push)) {
            const error = new Error('If isPush is selected, then params.push should be given.');
            winston.error(error);
            return { sent: false, err: error };
        }
        ({ messages, payloads } = push);

        // make sure every userIds[index] has a corresponding messages[index] and payloads[index]
        if (isEmpty(messages) || isEmpty(payloads)
            || messages.length !== payloads.length || messages.length !== userIds.length) {
            const error = new Error('Not every user has a corresponding message and/or payload.');
            winston.error(error);
            return { sent: false, err: error };
        }
    }
    if (isSMS) {
        if (isEmpty(sms)) {
            const error = new Error('If isSMS is selected, then params.sms should be given.');
            winston.error(error);
            return { sent: false, err: error };
        }
        ({ message, service } = sms);
        if (isEmpty(message)) {
            const error = new Error('params.sms.message should be given.');
            winston.error(error);
            return { sent: false, err: error };
        }
    }

    const notificationType = isEmpty(notificationTypeName)
        ? undefined
        : await NotificationType.findOne({ name: notificationTypeName }).lean();

    if (isEmpty(notificationType)) {
        if (isEmpty(notificationTypeName)) winston.debug('No notification type was given, will send the notification.');
        else winston.warn(`NotificationType with name <${notificationTypeName}> is not found, should send the notification.`);
    }

    const userEmails = [];
    const pushMessages = [];
    const mobile = [];

    let notFoundUsers = 0;

    for (let i = 0; i < userIds.length; i += 1) {
        const userId = userIds[i];
        const user = await User.findById(userId).select('email.address mobileToken phone.number banning.isBanned')
            .populate({
                path: 'userTokens',
                model: UserTokens,
                select: ['devices.notificationToken', 'notificationTypesChoices'],
            }).lean();

        if (isEmpty(user)) {
            notFoundUsers += 1;
            winston.error(`User <${userId}> not found`);
        } else if (user.banning?.isBanned && !isBanRelatedNotification) {
            winston.debug(`User <${userId}> is banned / deleted. Notification of type ${notificationType} not sent`);
        } else {
            const shouldSend = shouldSendNotification(notificationType, user.userTokens);

            if (isEmail) {
                if (isEmpty(user.email) || isEmpty(user.email.address)) {
                    winston.debug(`No email found for user <${userId}>`);
                } else if (shouldSend.email) {
                    userEmails.push(user.email.address);
                }
            }
            if (isPush) {
                if (shouldSend.push) {
                    let token;
                    if (!isEmpty(user.userTokens)) {
                        if (!isEmpty(user.userTokens.devices)) {
                            token = user.userTokens.devices.map((device) => (
                                !isEmpty(device.notificationToken) && !isEmpty(device.notificationToken.token)
                                    ? device.notificationToken.token : undefined)).filter((devToken) => !isEmpty(devToken));
                        } else if (!isEmpty(user.mobileToken) && !isEmpty(user.mobileToken.token)) {
                            token = user.mobileToken.token;
                        }
                    }
                    const { title, body, image } = messages[i];
                    // needs to check if notification with type 'chat' is sent before, so we don't save another doc in the DB.
                    let payload;
                    const {
                        firstTime, type, senderId,
                    } = payloads[i];
                    if (!firstTime || firstTime === 'true') {
                        payload = new Notification(payloads[i]);
                        if (type !== 'chat') {
                            payload.body = body;
                            payload.title = title;
                        }
                        try {
                            await payload.save();
                        } catch (error) {
                            winston.error(`Something went wrong when saving the push notification payload for user <${userId}> ${error}`);
                        }
                    } else {
                        payload = await Notification.findOne({
                            type: 'chat',
                            user,
                            senderId,
                        }).lean();
                    }
                    if (isEmpty(token)) {
                        winston.debug(`No token found for user <${userId}>. User maybe logged out, or has no device with google services.`);
                    } else {
                        const pushMessage = {
                            notification: { title, body, image },
                            android: { notification: { sound: 'default' } },
                            apns: { payload: { aps: { sound: 'default' } } },
                            data: { withSome: JSON.stringify(payload) },
                        };

                        if (Array.isArray(token)) {
                            for (let j = 0; j < token.length; j += 1) {
                                const msg = { ...pushMessage };
                                msg.token = token[j];
                                pushMessages.push(msg);
                            }
                        } else {
                            pushMessage.token = token;
                            pushMessages.push(pushMessage);
                        }
                    }
                }
            }

            if (isImportant || (isSMS && shouldSend.sms && !isEmpty(user.phone)
                && !isEmpty(user.phone.number))) mobile.push(user.phone.number);
        }
    }

    if (notFoundUsers === userIds.length) {
        return { sent: false, err: new Error('All of the users are not found.') };
    }

    // if no eligible users
    if (isEmpty(userEmails) && isEmpty(pushMessages) && isEmpty(mobile)) {
        return { sent: true };
    }

    let sentAtLeastOne = false;
    if (!isEmpty(userEmails)) {
        const toObject = { to: userEmails, ...extraRecipients };
        try {
            await sendEmail(toObject, subject, text, language);
            sentAtLeastOne = true;
        } catch (error) {
            winston.error(error);
        }
    }

    if (!isEmpty(pushMessages)) {
        try {
            await pushNotification(pushMessages);
            sentAtLeastOne = true;
        } catch (error) {
            winston.error(error);
        }
    }

    if (!isEmpty(mobile) && process.env.NODE_ENV === 'production') {
        try {
            await sendSMS(message, mobile, service);
            sentAtLeastOne = true;
        } catch (error) {
            winston.error(error);
        }
    }

    if (sentAtLeastOne) return { sent: true };

    return { sent: false, err: new Error('Check the logs for errors.') };
};

export default sendNotifications;

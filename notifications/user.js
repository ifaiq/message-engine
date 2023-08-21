/**
 * User Notifications
 * @module
 */

import config from 'config';
import moment from 'moment';
import winston from 'winston';

import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendBulkEmails from '../misc/sendBulkEmails.js';
import sendEmail from '../misc/sendEmail.js';
import sendNotifications from '../misc/notifications.js';

import Token from '../models/token.js';
import User from '../models/user.js';

const notificationsContainerURL = `${config.get('storage_host')}${config.get('notificationsContainer')}/`;

async function notifyUserAccountUnbanned(userId) {
    try {
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[user.language].user.userAccountUnbannedEmailSubject,
                text: messages[user.language].user.userAccountUnbannedEmailBody(user.username),
                language: user.language,
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'UserAccount', true);
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyUserAccountBanned(userId, banningReason) {
    try {
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[user.language].user.userAccountBannedEmailSubject,
                text: messages[user.language].user.userAccountBannedEmailBody(user.username, banningReason),
                language: user.language,
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'UserAccount', true);
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyUserUsernameUpdated(userId) {
    try {
        const user = await User.findById(userId).select('language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            user: userId,
            type: 'userProfile',
        };

        const pushSubject = messages[user.language].user.usernameUpdatedPushSubject;
        const pushBody = messages[user.language].user.usernameUpdatedPushBody;

        const notificationMeans = { isPush: true };
        const params = {
            push: {
                messages: [{ title: pushSubject, body: pushBody }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'UserAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}

// check if it has user ids when called
async function notifyUsersByPersonalizedEmails(emails, message, subject) {
    const users = await User.find({ 'email.address': emails }).select('_id language').lean();
    if (users.length !== emails.length) {
        const error = new Error('One or more users with the given emails array are not found');
        winston.error(error);
        return { sent: false, err: error };
    }

    return sendBulkEmails(users, subject, message, 'GeneralMandatory');
}

async function notifyUsersBySMS(phoneNumbers, message, service) {
    const users = await User.find({ 'phone.number': phoneNumbers }).select('language').lean();
    if (users.length !== phoneNumbers.length) {
        const error = new Error('One or more users with the given phone numbers array are not found');
        winston.error(error);
        return { sent: false, err: error };
    }

    const userIdsEn = [];
    const userIdsAr = [];
    for (let i = 0; i < users.length; i += 1) {
        const user = users[i];
        if (user.language === 'en') {
            userIdsEn.push(user._id);
        } else if (user.language === 'ar') {
            userIdsAr.push(user._id);
        } else {
            const error = new Error(`Undefined language <${user.language}> for user with ID <${user._id}>`);
            winston.error(error);
        }
    }

    const notificationMeans = { isSMS: true };
    const paramsEn = { sms: { message: message.en, service } };
    const paramsAr = { sms: { message: message.ar, service } };

    const { sent: sentEn, err: errEn } = await sendNotifications(notificationMeans, paramsEn, userIdsEn, 'GeneralMandatory');
    if (!sentEn) return { sent: sentEn, err: errEn };
    const { sent, err } = await sendNotifications(notificationMeans, paramsAr, userIdsAr, 'GeneralMandatory');
    if (!sent) return { sent, err };

    return { sent: true };
}

async function notifyUsersByPush(phoneNumbers, pushSubject, pushBody, pushImage) {
    const users = await User.find({ 'phone.number': phoneNumbers }).select('language').lean();
    if (users.length !== phoneNumbers.length) {
        const error = new Error('One or more users with the given phone numbers array are not found');
        winston.error(error);
        return { sent: false, err: error };
    }

    const userIds = [];
    const pushMessages = [];
    const payloads = [];
    for (let i = 0; i < users.length; i += 1) {
        const user = users[i];
        try {
            userIds.push(user._id);
            const payloadObj = {
                read: false,
                user: user._id,
                type: 'generic',
            };
            payloads.push(payloadObj);

            pushMessages.push({
                title: pushSubject[user.language],
                body: pushBody[user.language],
                image: pushImage ? `${notificationsContainerURL}${pushImage}` : undefined,
            });
        } catch (error) {
            winston.error(`Something went wrong when creating the push payload for user <${user._id}>`);
        }
    }

    const notificationMeans = { isPush: true };
    const params = { push: { messages: pushMessages, payloads } };
    const isNotificationSent = await sendNotifications(notificationMeans, params, userIds, 'GeneralMandatory');
    return isNotificationSent;
}

async function notifyUsersByPercentage(email, phone, push, percentage, message, subject, service, pushSubject, pushBody, pushImage) {
    const query = { 'banning.isBanned': false };
    const users = await User.aggregate([
        { $match: query },
        { $project: { email: 1, phone: 1, mobileToken: 1 } },
        { $sample: { size: Math.ceil((await User.countDocuments(query) * percentage) / 100) } },
    ]);

    if (email) {
        try {
            const mails = users.map((element) => element.email.address).filter((element) => (!!element));
            if (mails.length > 0) await notifyUsersByPersonalizedEmails(mails, message, subject);
        } catch (error) {
            winston.error('Something went wrong when notifying users by personalized emails');
            if (!(phone || push)) return { sent: false, err: error };
        }
    }

    if (phone) {
        try {
            const phones = users.map((element) => element.phone.number);
            if (phones.length > 0) await notifyUsersBySMS(phones, message, service);
        } catch (error) {
            winston.error('Something went wrong when notifying users by phone');
            if (!push) return { sent: false, err: error };
        }
    }

    if (push) {
        try {
            const phones = users.map((element) => element.phone.number);
            if (phones.length > 0) await notifyUsersByPush(phones, pushSubject, pushBody, pushImage);
        } catch (error) {
            winston.error('Something went wrong when notifying users by push');
            return { sent: false, err: error };
        }
    }

    return { sent: true };
}

async function verificationEmail(userId, host, emailAddress, token) {
    try {
        const user = await User.findById(userId).select('username language').lean();
        let body;
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const { type } = await Token.findOne({ token, _userId: userId }).select('type').lean() || {};
        if (type === 'emailOTP') {
            body = messages[user.language].user.verifyMailOTPBody(
                user.username,
                token,
            );
        } else {
            const link = `${host}verifyEmail?address=${emailAddress}&token=${token}&edit=true&lang=${user.language}`;
            body = messages[user.language].user.verifyMailMailBody(
                user.username,
                link,
            );
        }
        // Calling sendEmail direct since this function wants to send the email to the param emailAddress (and can't be unsubscribed anyways)
        await sendEmail(
            emailAddress,
            messages[user.language].user.verifyMailMailSubject,
            body,
            user.language,
        );
        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function resetPassword(userId, host, token) {
    try {
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const link = `${host}password/reset/${token}?lang=${user.language}`;

        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[user.language].user.resetPasswordMailSubject,
                text: messages[user.language].user.resetPasswordMailBody(user.username, link),
                language: user.language,
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'UserAccount');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyUserAccountDeletionRequested(userId) {
    try {
        const user = await User.findById(userId).select('username phone.number language banning.isBanned accountDeletionDateTime').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        if (user.banning?.isBanned !== true || !user.accountDeletionDateTime) {
            const error = new Error(`User with ID <${userId}> did not make delete request`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const formattedAccountDeletionDateTime = moment(user.accountDeletionDateTime).utc().format('DD/MM/YYYY @ hh:mm A G\\MT');

        const notificationMeans = { isEmail: true, isSMS: true };
        const params = {
            email: {
                subject: messages[user.language].user.accountDeletionRequestMailSubject,
                text: messages[user.language].user.accountDeletionRequestMailBody(user.username, user.phone.number, formattedAccountDeletionDateTime),
                language: user.language,
            },
            sms: {
                message: messages[user.language].user.accountDeletionRequestSMS(formattedAccountDeletionDateTime),
                service: 'primary',
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'GeneralMandatory', true);
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyUserAccountRestored(userId, loginTime) {
    try {
        const user = await User.findById(userId).select('username language banning.isBanned accountDeletionDateTime').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        if (user.banning?.isBanned === true || user.accountDeletionDateTime) {
            const error = new Error(`User with ID <${userId}> is still banned/has a deletion request.`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const formattedLoginTime = moment(loginTime).utc().format('DD/MM/YYYY @ hh:mm A G\\MT');

        const notificationMeans = { isEmail: true, isSMS: true };
        const params = {
            email: {
                subject: messages[user.language].user.accountRestorationMailSubject,
                text: messages[user.language].user.accountRestorationMailBody(user.username, formattedLoginTime),
                language: user.language,
            },
            sms: {
                message: messages[user.language].user.accountRestorationSMS(formattedLoginTime),
                service: 'primary',
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'GeneralMandatory', true);
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyUserAccountUnbanned,
    notifyUserAccountBanned,
    notifyUserUsernameUpdated,
    notifyUsersByPersonalizedEmails,
    notifyUsersBySMS,
    notifyUsersByPush,
    notifyUsersByPercentage,
    verificationEmail,
    resetPassword,
    notifyUserAccountDeletionRequested,
    notifyUserAccountRestored,
};

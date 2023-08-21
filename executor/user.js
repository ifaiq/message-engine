/**
 * User Executor
 * @module
 */

import Queue from 'bull';
import winston from 'winston';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyUserAccountBanned,
    notifyUserAccountUnbanned,
    notifyUserUsernameUpdated,
    notifyUsersByPercentage,
    notifyUsersByPersonalizedEmails,
    notifyUsersByPush,
    notifyUsersBySMS,
    resetPassword,
    verificationEmail,
    notifyUserAccountDeletionRequested,
    notifyUserAccountRestored,
} from '../notifications/user.js';

const accountBanningQueue = new Queue(queues.user.accountBanning.queueName, redis);
const userDetailsQueue = new Queue(queues.user.userDetails.queueName, redis);
const systemNotificationsQueue = new Queue(queues.user.systemNotifications.queueName, redis);

export default async () => {
    // User account unbanned
    accountBanningQueue.process(queues.user.accountBanning.unbanningUser.jobName, async (job, done) => {
        winston.debug(`${queues.user.accountBanning.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserAccountUnbanned(job.data.userId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // User account banned
    accountBanningQueue.process(queues.user.accountBanning.banningUser.jobName, async (job, done) => {
        winston.debug(`${queues.user.accountBanning.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserAccountBanned(job.data.userId, job.data.banningReason);
        if (sent) done(null, 'Success');
        else done(err);
    });

    accountBanningQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.user.accountBanning.queueName}> is stalled`);
    });

    accountBanningQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.user.accountBanning.queueName}> completed successfully. Result: ${result}`);
    });

    accountBanningQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.user.accountBanning.queueName}> failed. Error: ${err}`, err);
    });

    accountBanningQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.user.accountBanning.queueName}>. Error: ${err}`, err);
    });

    accountBanningQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.user.accountBanning.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    accountBanningQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.user.accountBanning.queueName}> has started`);
    });

    accountBanningQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.user.accountBanning.queueName}> paused`);
    });

    accountBanningQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.user.accountBanning.queueName}> resumed`);
    });

    accountBanningQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.user.accountBanning.queueName}> removed successfully`);
    });

    // Username updated
    userDetailsQueue.process(queues.user.userDetails.usernameUpdated.jobName, async (job, done) => {
        winston.debug(`${queues.user.userDetails.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserUsernameUpdated(
            job.data.userId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Email updated
    userDetailsQueue.process(queues.user.userDetails.verificationEmail.jobName, async (job, done) => {
        winston.debug(`${queues.user.userDetails.queueName}: Executing job #${job.id}`);
        const { sent, err } = await verificationEmail(
            job.data.userId,
            job.data.host,
            job.data.emailAddress,
            job.data.token,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Password Reset
    userDetailsQueue.process(queues.user.userDetails.resetPassword.jobName, async (job, done) => {
        winston.debug(`${queues.user.userDetails.queueName}: Executing job #${job.id}`);
        const { sent, err } = await resetPassword(
            job.data.userId,
            job.data.host,
            job.data.token,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Account Deletion Request
    userDetailsQueue.process(queues.user.userDetails.accountDeletionRequest.jobName, async (job, done) => {
        winston.debug(`${queues.user.userDetails.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserAccountDeletionRequested(
            job.data.userId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Account Restoration
    userDetailsQueue.process(queues.user.userDetails.accountRestored.jobName, async (job, done) => {
        winston.debug(`${queues.user.userDetails.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserAccountRestored(
            job.data.userId,
            job.data.loginTime,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    userDetailsQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.user.userDetails.queueName}> is stalled`);
    });

    userDetailsQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.user.userDetails.queueName}> completed successfully. Result: ${result}`);
    });

    userDetailsQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.user.userDetails.queueName}> failed. Error: ${err}`, err);
    });

    userDetailsQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.user.userDetails.queueName}>. Error: ${err}`, err);
    });

    userDetailsQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.user.userDetails.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    userDetailsQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.user.userDetails.queueName}> has started`);
    });

    userDetailsQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.user.userDetails.queueName}> paused`);
    });

    userDetailsQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.user.userDetails.queueName}> resumed`);
    });

    userDetailsQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.user.userDetails.queueName}> removed successfully`);
    });

    // System notifications
    systemNotificationsQueue.process(queues.user.systemNotifications.email.jobName, async (job, done) => {
        winston.debug(`${queues.user.systemNotifications.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersByPersonalizedEmails(
            job.data.emails,
            job.data.message,
            job.data.subject,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    systemNotificationsQueue.process(queues.user.systemNotifications.sms.jobName, async (job, done) => {
        winston.debug(`${queues.user.systemNotifications.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersBySMS(
            job.data.phoneNumbers,
            job.data.message,
            job.data.service,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    systemNotificationsQueue.process(queues.user.systemNotifications.push.jobName, async (job, done) => {
        winston.debug(`${queues.user.systemNotifications.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersByPush(
            job.data.phoneNumbers,
            job.data.pushTitle,
            job.data.pushBody,
            job.data.pushImage,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    systemNotificationsQueue.process(queues.user.systemNotifications.percentage.jobName, async (job, done) => {
        winston.debug(`${queues.user.systemNotifications.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersByPercentage(
            job.data.email,
            job.data.phone,
            job.data.push,
            job.data.percentage,
            job.data.message,
            job.data.subject,
            job.data.service,
            job.data.pushTitle,
            job.data.pushBody,
            job.data.pushImage,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    systemNotificationsQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.user.systemNotifications.queueName}> is stalled`);
    });

    systemNotificationsQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.user.systemNotifications.queueName}> completed successfully. Result: ${result}`);
    });

    systemNotificationsQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.user.systemNotifications.queueName}> failed. Error: ${err}`, err);
    });

    systemNotificationsQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.user.systemNotifications.queueName}>. Error: ${err}`, err);
    });

    systemNotificationsQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.user.systemNotifications.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    systemNotificationsQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.user.systemNotifications.queueName}> has started`);
    });

    systemNotificationsQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.user.systemNotifications.queueName}> paused`);
    });

    systemNotificationsQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.user.systemNotifications.queueName}> resumed`);
    });

    systemNotificationsQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.user.systemNotifications.queueName}> removed successfully`);
    });
};

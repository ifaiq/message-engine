/**
 * Engagement Executor
 * @module engagementExecuter
 */

import winston from 'winston';
import Queue from 'bull';

import redis from '../startup/redis.js';

import queues from '../models/bull-config/queues.config.js';

import {
    notifyInterestedUsers,
    notifyUsersWhoPosted,
    notifySellers,
    notifyUsersFromSearch,
} from '../notifications/engagement.js';

const { queueName } = queues.engagement;
const engagementQueue = new Queue(queueName, redis);

export default async () => {
    // Interested Users in a Post
    engagementQueue.process(queues.engagement.interestedUsers.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyInterestedUsers(
            job.data.postId,
            job.data.isEmail,
            job.data.emailSubject,
            job.data.emailMessage,
            job.data.isPush,
            job.data.pushTitle,
            job.data.pushBody,
            job.data.isSMS,
            job.data.smsMessage,
            job.data.smsService,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    // Users Who Posted
    engagementQueue.process(queues.engagement.usersWhoPosted.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersWhoPosted(
            job.data.numberOfPosts,
            job.data.isEmail,
            job.data.emailSubject,
            job.data.emailMessage,
            job.data.isPush,
            job.data.pushTitle,
            job.data.pushBody,
            job.data.pushImage,
            job.data.isSMS,
            job.data.smsMessage,
            job.data.smsService,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    // Sellers Who Completed Orders
    engagementQueue.process(queues.engagement.sellersWhoCompletedOrders.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellers(
            job.data.numberOfOrders,
            job.data.isEmail,
            job.data.emailSubject,
            job.data.emailMessage,
            job.data.isPush,
            job.data.pushTitle,
            job.data.pushBody,
            job.data.pushImage,
            job.data.isSMS,
            job.data.smsMessage,
            job.data.smsService,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    // Users From Search Results
    engagementQueue.process(queues.engagement.usersFromSearch.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersFromSearch(
            job.data.phone,
            job.data.email,
            job.data.isVerified,
            job.data.username,
            job.data.exemptedFromCommission,
            job.data.isEmail,
            job.data.emailSubject,
            job.data.emailMessage,
            job.data.isPush,
            job.data.pushTitle,
            job.data.pushBody,
            job.data.pushImage,
            job.data.isSMS,
            job.data.smsMessage,
            job.data.smsService,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    engagementQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queueName}> is stalled`);
    });

    engagementQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queueName}> completed successfully. Result: ${result}`);
    });

    engagementQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queueName}> failed. Error: ${err}`, err);
    });

    engagementQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queueName}>. Error: ${err}`, err);
    });

    engagementQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queueName}> waiting to be processed as soon as a worker is idling`);
    });

    engagementQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queueName}> has started`);
    });

    engagementQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queueName}> paused`);
    });

    engagementQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queueName}> resumed`);
    });

    engagementQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queueName}> removed successfully`);
    });
};

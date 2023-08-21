/**
* Gifts Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import { notifyGiftUnlocked, /* notifyEarnFreeGift, */ notifyGiftBlocked, notifyGiftExpiry } from '../notifications/gifts.js';

const giftsQueue = new Queue(queues.gifts.queueName, redis);

export default async () => {
    // Gift unlocked
    giftsQueue.process(queues.gifts.giftUnlocked.jobName, async (job, done) => {
        winston.debug(`${queues.gifts.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyGiftUnlocked(
            job.data.giftId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    // Earn free gift
    giftsQueue.process(queues.gifts.earnFreeGift.jobName, async (job, done) => {
        winston.debug(`${queues.gifts.queueName}: Executing job #${job.id}`);
        // Requirements to disable this notification.
        done(null, 'Success');
        /* const { sent, err } = await notifyEarnFreeGift();
        if (sent) done(null, 'Success');
        else done(err); */
    });
    // Gift blocked
    giftsQueue.process(queues.gifts.gift6Blocked.jobName, async (job, done) => {
        winston.debug(`${queues.gifts.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyGiftBlocked(
            job.data.giftId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    giftsQueue.process(queues.gifts.giftExpiry.jobName, async (job, done) => {
        winston.debug(`${queues.gifts.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyGiftExpiry(
            job.data.giftId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    giftsQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.gifts.queueName}> is stalled`);
    });

    giftsQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.gifts.queueName}> completed successfully. Result: ${result}`);
    });

    giftsQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.gifts.queueName}> failed. Error: ${err}`, err);
    });

    giftsQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.gifts.queueName}>. Error: ${err}`, err);
    });

    giftsQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.gifts.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    giftsQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.gifts.queueName}> has started`);
    });

    giftsQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.gifts.queueName}> paused`);
    });

    giftsQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.gifts.queueName}> resumed`);
    });

    giftsQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.gifts.queueName}> removed successfully`);
    });
};

/**
* Checkout Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import { notifyUserToCompleteBuyNowCheckout, notifyUserToCompleteAuctionCheckout } from '../notifications/checkout.js';

const checkoutQueue = new Queue(queues.checkout.queueName, redis);
export default async () => {
    // Complete BuyNow Checkout
    checkoutQueue.process(queues.checkout.completedBuyNowCheckout.jobName, async (job, done) => {
        winston.debug(`${queues.checkout.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserToCompleteBuyNowCheckout(
            job.data.checkoutId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    checkoutQueue.process(queues.checkout.completedAuctionCheckout.jobName, async (job, done) => {
        winston.debug(`${queues.checkout.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserToCompleteAuctionCheckout(
            job.data.checkoutId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    checkoutQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.checkout.queueName}> is stalled`);
    });

    checkoutQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.checkout.queueName}> completed successfully. Result: ${result}`);
    });

    checkoutQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.checkout.queueName}> failed. Error: ${err}`, err);
    });

    checkoutQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.checkout.queueName}>. Error: ${err}`, err);
    });

    checkoutQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.checkout.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    checkoutQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.checkout.queueName}> has started`);
    });

    checkoutQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.checkout.queueName}> paused`);
    });

    checkoutQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.checkout.queueName}> resumed`);
    });

    checkoutQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.feedback.queueName}> removed successfully`);
    });
};

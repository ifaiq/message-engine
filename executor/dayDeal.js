/**
* Day Deal Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import notifyUsersDayDealStarting from '../notifications/dayDeal.js';

const dayDealQueue = new Queue(queues.dayDeal.queueName, redis);

export default async () => {
    // Post started
    dayDealQueue.process(queues.dayDeal.postStartingJobName, async (job, done) => {
        winston.debug(`${queues.dayDeal.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersDayDealStarting(
            job.data.dayDealId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    dayDealQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.dayDeal.queueName}> is stalled`);
    });

    dayDealQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.dayDeal.queueName}> completed successfully. Result: ${result}`);
    });

    dayDealQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.dayDeal.queueName}> failed. Error: ${err}`, err);
    });

    dayDealQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.dayDeal.queueName}>. Error: ${err}`, err);
    });

    dayDealQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.dayDeal.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    dayDealQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.dayDeal.queueName}> has started`);
    });

    dayDealQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.dayDeal.queueName}> paused`);
    });

    dayDealQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.dayDeal.queueName}> resumed`);
    });

    dayDealQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.dayDeal.queueName}> removed successfully`);
    });
};

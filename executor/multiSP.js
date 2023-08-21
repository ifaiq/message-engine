/**
* MultiSP Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import * as multiSPNotifications from '../notifications/multiSP.js';

const multiSPQueue = new Queue(queues.multiSP.queueName, redis);
export default async () => {
    // post items ready to pick up
    multiSPQueue.process(queues.multiSP.postItemsReady.jobName, async (job, done) => {
        winston.debug(`${queues.multiSP.queueName}: Executing job #${job.id}`);
        const { sent, err } = await multiSPNotifications.notifySellerPostReady(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    multiSPQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.multiSP.queueName}> is stalled`);
    });

    multiSPQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.multiSP.queueName}> completed successfully. Result: ${result}`);
    });

    multiSPQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.multiSP.queueName}> failed. Error: ${err}`, err);
    });

    multiSPQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.multiSP.queueName}>. Error: ${err}`, err);
    });

    multiSPQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.multiSP.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    multiSPQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.multiSP.queueName}> has started`);
    });

    multiSPQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.multiSP.queueName}> paused`);
    });

    multiSPQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.multiSP.queueName}> resumed`);
    });

    multiSPQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.multiSP.queueName}> removed successfully`);
    });
};

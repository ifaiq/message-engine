/**
* offlineRequest Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import offlineRequestCreated from '../notifications/offlinePostRequest.js';

const requestQueue = new Queue(queues.offlineRequest.queueName, redis);

export default async () => {
    requestQueue.process(queues.offlineRequest.offlineRequestCreated.jobName, async (job, done) => {
        winston.debug(`${queues.offlineRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await offlineRequestCreated(
            job.data.userId,
            job.data.addressObj,
            job.data.type,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    requestQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.offlineRequest.queueName}> is stalled`);
    });

    requestQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.offlineRequest.queueName}> completed successfully. Result: ${result}`);
    });

    requestQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.offlineRequest.queueName}> failed. Error: ${err}`, err);
    });

    requestQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.offlineRequest.queueName}>. Error: ${err}`, err);
    });

    requestQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.offlineRequest.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    requestQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.offlineRequest.queueName}> has started`);
    });

    requestQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.offlineRequest.queueName}> paused`);
    });

    requestQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.offlineRequest.queueName}> resumed`);
    });

    requestQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.offlineRequest.queueName}> removed successfully`);
    });
};

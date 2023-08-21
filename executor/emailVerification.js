/**
 * Email Verification Executor
 * @module
 */

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
// import notifyUserEmailNotVerified from '../notifications/emailVerification.js';

const { emailVerification } = queues;

const fillProfileDataQueue = new Queue(emailVerification.queueName, redis);

export default async () => {
    fillProfileDataQueue.process(emailVerification.jobName, async (job, done) => {
        winston.debug(`${emailVerification.queueName}: Executing job #${job.id}`);
        done(null, 'Success');
        // Requirements to disable this notification.
        /* const { sent, err } = notifyUserEmailNotVerified();
        if (sent) done(null, 'Success');
        else done(err); */
    });

    fillProfileDataQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${emailVerification.queueName}> is stalled`);
    });

    fillProfileDataQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${emailVerification.queueName}> completed successfully. Result: ${result}`);
    });

    fillProfileDataQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${emailVerification.queueName}> failed. Error: ${err}`, err);
    });

    fillProfileDataQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${emailVerification.queueName}>. Error: ${err}`, err);
    });

    fillProfileDataQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${emailVerification.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    fillProfileDataQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${emailVerification.queueName}> has started`);
    });

    fillProfileDataQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${emailVerification.queueName}> paused`);
    });

    fillProfileDataQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${emailVerification.queueName}> resumed`);
    });

    fillProfileDataQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${emailVerification.queueName}> removed successfully`);
    });
};

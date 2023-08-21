/**
* Action Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import notifyUserPendingActions from '../notifications/action.js';

const actionQueue = new Queue(queues.action.queueName, redis);

export default async () => {
    actionQueue.process(queues.action.actionReminder.jobName, async (job, done) => {
        winston.debug(`${queues.action.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserPendingActions(
            job.data.actionId,
            job.data.link,
            job.data.fromRequestFlag,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    actionQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.action.queueName}> is stalled`);
    });

    actionQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.action.queueName}> completed successfully. Result: ${result}`);
    });

    actionQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.action.queueName}> failed. Error: ${err}`, err);
    });

    actionQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.action.queueName}>. Error: ${err}`, err);
    });

    actionQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.action.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    actionQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.action.queueName}> has started`);
    });

    actionQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.action.queueName}> paused`);
    });

    actionQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.action.queueName}> resumed`);
    });

    actionQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.action.queueName}> removed successfully`);
    });
};

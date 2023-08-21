/**
 * Penalty Executor
 * @module
 */

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import { notifyUserPenaltyApplied, notifyUserPenaltyResetByAdmin } from '../notifications/penalty.js';

const penaltyQueue = new Queue(queues.penalty.queueName, redis);

export default async () => {
    // penalty applied on user
    penaltyQueue.process(queues.penalty.penaltyApplied.jobName, async (job, done) => {
        winston.debug(`${queues.penalty.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserPenaltyApplied(
            job.data.userId,
            job.data.penaltyAmount,
            job.data.penaltyReason,
            job.data.objectType,
            job.data.objectId,
            job.data.link,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    // penalty reset by admin
    penaltyQueue.process(queues.penalty.penaltyRemoved.jobName, async (job, done) => {
        winston.debug(`${queues.penalty.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserPenaltyResetByAdmin(
            job.data.userId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    penaltyQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.penalty.queueName}> is stalled`);
    });

    penaltyQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.penalty.queueName}> completed successfully. Result: ${result}`);
    });

    penaltyQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.penalty.queueName}> failed. Error: ${err}`, err);
    });

    penaltyQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${queues.penalty.queueName}>. Error: ${err}`, err);
    });

    penaltyQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.penalty.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    penaltyQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.penalty.queueName}> has started`);
    });

    penaltyQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${queues.penalty.queueName}> paused`);
    });

    penaltyQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${queues.penalty.queueName}> resumed`);
    });

    penaltyQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.penalty.queueName}> removed successfully`);
    });
};

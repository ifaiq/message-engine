/**
* Feedback Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import notifyUserReviewOrder from '../notifications/feedback.js';

const feedbackQueue = new Queue(queues.feedback.queueName, redis);

export default async () => {
    // Add new feedback
    feedbackQueue.process(queues.feedback.createFeedback.jobName, async (job, done) => {
        winston.debug(`${queues.feedback.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserReviewOrder(
            job.data.orderId,
            job.data.revieweeType,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    feedbackQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.feedback.queueName}> is stalled`);
    });

    feedbackQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.feedback.queueName}> completed successfully. Result: ${result}`);
    });

    feedbackQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.feedback.queueName}> failed. Error: ${err}`, err);
    });

    feedbackQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.feedback.queueName}>. Error: ${err}`, err);
    });

    feedbackQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.feedback.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    feedbackQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.feedback.queueName}> has started`);
    });

    feedbackQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.feedback.queueName}> paused`);
    });

    feedbackQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.feedback.queueName}> resumed`);
    });

    feedbackQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.feedback.queueName}> removed successfully`);
    });
};

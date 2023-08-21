/**
 * Chat Executer
 * @module
 */

import Queue from 'bull';
import winston from 'winston';
import queues from '../models/bull-config/queues.config.js';
import sendChatNotification from '../notifications/chat.js';
import redis from '../startup/redis.js';

const chatQueue = new Queue(queues.chat.queueName, redis);

export default async () => {
    chatQueue.process(queues.chat.messageSent.jobName, async (job, done) => {
        winston.debug(`${queues.chat.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sendChatNotification(
            job.data.senderId,
            job.data.recipientId,
            job.data.message,
            job.data.link,
            job.data.type,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    chatQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.chat.queueName}> is stalled`);
    });

    chatQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.chat.queueName}> completed successfully. Result: ${result}`);
    });

    chatQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.chat.queueName}> failed. Error: ${err}`, err);
    });

    chatQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${queues.chat.queueName}>. Error: ${err}`, err);
    });

    chatQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.chat.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    chatQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.chat.queueName}> has started`);
    });

    chatQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${queues.chat.queueName}> paused`);
    });

    chatQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${queues.chat.queueName}> resumed`);
    });

    chatQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.chat.queueName}> removed successfully`);
    });
};

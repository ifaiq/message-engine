/**
* Notification Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import sendNotificationReminder from '../notifications/notificationReminder.js';

const notificationReminderQueue = new Queue(queues.notificationReminder.queueName, redis);
export default async () => {
    notificationReminderQueue.process(queues.notificationReminder.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sendNotificationReminder(
            job.data.id,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    notificationReminderQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.notificationReminder.queueName}> is stalled`);
    });

    notificationReminderQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.notificationReminder.queueName}> completed successfully. Result: ${result}`);
    });

    notificationReminderQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.notificationReminder.queueName}> failed. Error: ${err}`, err);
    });

    notificationReminderQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${queues.notificationReminder.queueName}>. Error: ${err}`, err);
    });

    notificationReminderQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.notificationReminder.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    notificationReminderQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.notificationReminder.queueName}> has started`);
    });

    notificationReminderQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${queues.notificationReminder.queueName}> paused`);
    });

    notificationReminderQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${queues.notificationReminder.queueName}> resumed`);
    });

    notificationReminderQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.notificationReminder.queueName}> removed successfully`);
    });
};

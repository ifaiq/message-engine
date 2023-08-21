import Queue from 'bull';
import winston from 'winston';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import reminder from '../notifications/reminder.js';

const importantNotificationQueue = new Queue(queues.importantReminders.queueName, redis);

export default async () => {
    /* "MyPosts" open push notifications reminder */
    importantNotificationQueue.process(queues.importantReminders.acceptedPost.jobName, async (job, done) => {
        winston.debug(`${queues.importantReminders.queueName}: Executing job #${job.id}`);
        const { sent, err } = await reminder(job.data.userId, job.data.notificationName, 'approvedPostReminder');
        if (sent) done(null, 'Success');
        else done(err);
    });

    //-----------------------------------------------------
    /* "MyPurchases" open push notifications reminder */
    importantNotificationQueue.process(queues.importantReminders.orderCreated.jobName, async (job, done) => {
        winston.debug(`${queues.importantReminders.queueName}: Executing job #${job.id}`);
        const { sent, err } = await reminder(job.data.userId, job.data.notificationName, 'completedPurchases');
        if (sent) done(null, 'Success');
        else done(err);
    });
    //----------------------------------------------------
    /* "MyAuctions" open push notifications reminder */
    importantNotificationQueue.process(queues.importantReminders.bidding.jobName, async (job, done) => {
        winston.debug(`${queues.importantReminders.queueName}: Executing job #${job.id}`);
        const { sent, err } = await reminder(job.data.userId, job.data.notificationName, 'startedBiddings');
        if (sent) done(null, 'Success');
        else done(err);
    });
    /* Starting Events */
    importantNotificationQueue.on('active', async (job) => {
        winston.debug(`Job #${job.id} in queue <${queues.importantReminders.queueName}> has started`);
    });

    importantNotificationQueue.on('completed', async (job) => {
        winston.debug(`Job #${job.id} in queue <${queues.importantReminders.queueName}> has been completed!`);
    });

    importantNotificationQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${queues.importantReminders.queueName}>. Error: ${err}`, err);
    });
};

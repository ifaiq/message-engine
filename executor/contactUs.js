/**
* Contact Us Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import notifyContactUsResponse from '../notifications/contactUs.js';

const contactUsQueue = new Queue(queues.contactUs.queueName, redis);

export default async () => {
    // ContactUs response
    contactUsQueue.process(queues.contactUs.contactUsResponse.jobName, async (job, done) => {
        winston.debug(`${queues.contactUs.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyContactUsResponse(
            job.data.contactUsId,
            job.data.brandName,
            job.data.language,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    contactUsQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.contactUs.queueName}> is stalled`);
    });

    contactUsQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.contactUs.queueName}> completed successfully. Result: ${result}`);
    });

    contactUsQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.contactUs.queueName}> failed. Error: ${err}`, err);
    });

    contactUsQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.contactUs.queueName}>. Error: ${err}`, err);
    });

    contactUsQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.contactUs.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    contactUsQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.contactUs.queueName}> has started`);
    });

    contactUsQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.contactUs.queueName}> paused`);
    });

    contactUsQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.contactUs.queueName}> resumed`);
    });

    contactUsQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.contactUs.queueName}> removed successfully`);
    });
};

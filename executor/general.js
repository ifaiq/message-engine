/**
* General Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import pushToTopic from '../notifications/general.js';
import queues from '../models/bull-config/queues.config.js';

const generalQueue = new Queue(queues.general.queueName, redis);

export default async () => {
    // Push to topic
    generalQueue.process(queues.general.topic.jobName, async (job, done) => {
        winston.debug(`${queues.general.queueName}: Executing job #${job.id}`);
        const { sent, err } = await pushToTopic(
            { title: job.data.title, body: job.data.body },
            job.data.payload,
            job.data.topic,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    generalQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.general.queueName}> is stalled`);
    });

    generalQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.general.queueName}> completed successfully. Result: ${result}`);
    });

    generalQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.general.queueName}> failed. Error: ${err}`, err);
    });

    generalQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.general.queueName}>. Error: ${err}`, err);
    });

    generalQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.general.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    generalQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.general.queueName}> has started`);
    });

    generalQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.general.queueName}> paused`);
    });

    generalQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.general.queueName}> resumed`);
    });

    generalQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.general.queueName}> removed successfully`);
    });
};

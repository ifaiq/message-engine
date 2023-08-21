/**
* Shareable Link Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyUserLinkRegenerated,
    notifyUserLinkExtended,
} from '../notifications/shareableLink.js';

const shareableLinkQueue = new Queue(queues.shareableLink.queueName, redis);

export default async () => {
    // Shareable link regeneration
    shareableLinkQueue.process(queues.shareableLink.linkRegenerated.jobName, async (job, done) => {
        winston.debug(`${queues.shareableLink.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserLinkRegenerated(
            job.data.userId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Shareable link extension
    shareableLinkQueue.process(queues.shareableLink.linkExtended.jobName, async (job, done) => {
        winston.debug(`${queues.shareableLink.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserLinkExtended(
            job.data.inviterId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    shareableLinkQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.shareableLink.queueName}> is stalled`);
    });

    shareableLinkQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.shareableLink.queueName}> completed successfully. Result: ${result}`);
    });

    shareableLinkQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.shareableLink.queueName}> failed. Error: ${err}`, err);
    });

    shareableLinkQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.shareableLink.queueName}>. Error: ${err}`, err);
    });

    shareableLinkQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.shareableLink.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    shareableLinkQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.shareableLink.queueName}> has started`);
    });

    shareableLinkQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.shareableLink.queueName}> paused`);
    });

    shareableLinkQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.shareableLink.queueName}> resumed`);
    });

    shareableLinkQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.shareableLink.queueName}> removed successfully`);
    });
};

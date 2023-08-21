/**
* Shopping Cart Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyUsersShoppingCartPostRunningOut,
    notifyUsersShoppingCartPostDiscounted,
    notifyUserShoppingCartPostReposted,
} from '../notifications/shoppingCart.js';

const shoppingCartQueue = new Queue(queues.shoppingCart.queueName, redis);

export default async () => {
    // Post expiring soon or quantity running out
    shoppingCartQueue.process(queues.shoppingCart.postRunningOutJobName, async (job, done) => {
        winston.debug(`${queues.shoppingCart.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersShoppingCartPostRunningOut(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Post discounted
    shoppingCartQueue.process(queues.shoppingCart.postDiscountedJobName, async (job, done) => {
        winston.debug(`${queues.shoppingCart.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersShoppingCartPostDiscounted(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Post reposted
    shoppingCartQueue.process(queues.shoppingCart.postRepostedJobName, async (job, done) => {
        winston.debug(`${queues.shoppingCart.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserShoppingCartPostReposted(
            job.data.userId,
            job.data.oldId,
            job.data.newId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    shoppingCartQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.shoppingCart.queueName}> is stalled`);
    });

    shoppingCartQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.shoppingCart.queueName}> completed successfully. Result: ${result}`);
    });

    shoppingCartQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.shoppingCart.queueName}> failed. Error: ${err}`, err);
    });

    shoppingCartQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.shoppingCart.queueName}>. Error: ${err}`, err);
    });

    shoppingCartQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.shoppingCart.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    shoppingCartQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.shoppingCart.queueName}> has started`);
    });

    shoppingCartQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.shoppingCart.queueName}> paused`);
    });

    shoppingCartQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.shoppingCart.queueName}> resumed`);
    });

    shoppingCartQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.shoppingCart.queueName}> removed successfully`);
    });
};

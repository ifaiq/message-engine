/**
* Watch List Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyUsersWatchlistPostRunningOut,
    notifyUsersWatchlistPostDiscounted,
    notifyUserWatchlistPostReposted,
} from '../notifications/watchlist.js';

const watchlistQueue = new Queue(queues.watchlist.queueName, redis);

export default async () => {
    // Post expiring soon or quantity running out
    watchlistQueue.process(queues.watchlist.postRunningOutJobName, async (job, done) => {
        winston.debug(`${queues.watchlist.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersWatchlistPostRunningOut(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Post discounted
    watchlistQueue.process(queues.watchlist.postDiscountedJobName, async (job, done) => {
        winston.debug(`${queues.watchlist.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersWatchlistPostDiscounted(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Post reposted
    watchlistQueue.process(queues.watchlist.postRepostedJobName, async (job, done) => {
        winston.debug(`${queues.watchlist.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserWatchlistPostReposted(
            job.data.userId,
            job.data.oldId,
            job.data.newId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    watchlistQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.watchlist.queueName}> is stalled`);
    });

    watchlistQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.watchlist.queueName}> completed successfully. Result: ${result}`);
    });

    watchlistQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.watchlist.queueName}> failed. Error: ${err}`, err);
    });

    watchlistQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.watchlist.queueName}>. Error: ${err}`, err);
    });

    watchlistQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.watchlist.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    watchlistQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.watchlist.queueName}> has started`);
    });

    watchlistQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.watchlist.queueName}> paused`);
    });

    watchlistQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.watchlist.queueName}> resumed`);
    });

    watchlistQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.watchlist.queueName}> removed successfully`);
    });
};

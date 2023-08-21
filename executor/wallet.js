/**
 * Wallet Executor
 * @module wallet
 */

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import notifyWalletCharged from '../notifications/wallet.js';
import queues from '../models/bull-config/queues.config.js';

const { queueName } = queues.wallet;
const walletQueue = new Queue(queueName, redis);

export default async () => {
    //------------------------------------------------------------------------
    // Wallet charged
    walletQueue.process(queues.wallet.charged.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyWalletCharged(
            job.data.depositRequestId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    //------------------------------------------------------------------------
    //------------------------------------------------------------------------
    walletQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queueName}> is stalled`);
    });

    walletQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queueName}> completed successfully. Result: ${result}`);
    });

    walletQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queueName}> failed. Error: ${err}`, err);
    });

    walletQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queueName}>. Error: ${err}`, err);
    });

    walletQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queueName}> waiting to be processed as soon as a worker is idling`);
    });

    walletQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queueName}> has started`);
    });

    walletQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queueName}> paused`);
    });

    walletQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queueName}> resumed`);
    });

    walletQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queueName}> removed successfully`);
    });
};

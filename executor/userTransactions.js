/**
* UserTransactions Executor
* @module
*/
import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import notifyTransactionCompleted from '../notifications/userTransactions.js';

const transactionQueue = new Queue(queues.transaction.queueName, redis);

export default async () => {
    transactionQueue.process(queues.transaction.transactionCompleted.jobName, async (job, done) => {
        winston.debug(`${queues.transaction.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyTransactionCompleted(
            job.data.userId,
            job.data.type,
            job.data.amount,
            job.data.id,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    transactionQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.transaction.queueName}> is stalled`);
    });

    transactionQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.transaction.queueName}> completed successfully. Result: ${result}`);
    });

    transactionQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.transaction.queueName}> failed. Error: ${err}`, err);
    });

    transactionQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.transaction.queueName}>. Error: ${err}`, err);
    });

    transactionQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.transaction.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    transactionQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.transaction.queueName}> has started`);
    });

    transactionQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.transaction.queueName}> paused`);
    });

    transactionQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.transaction.queueName}> resumed`);
    });

    transactionQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.transaction.queueName}> removed successfully`);
    });
};

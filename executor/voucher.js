/**
* Voucher Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import { notifyVoucherReissued, sendSecondaryVoucherForGift6 } from '../notifications/voucher.js';

const vouchersQueue = new Queue(queues.voucher.queueName, redis);

export default async () => {
    // Voucher created
    vouchersQueue.process(queues.voucher.reissued.jobName, async (job, done) => {
        winston.debug(`${queues.voucher.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyVoucherReissued(
            job.data.voucherId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Send secondary voucher created by accumulation of gift 6
    vouchersQueue.process(queues.voucher.gift6SecondaryVoucher.jobName, async (job, done) => {
        winston.debug(`${queues.voucher.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sendSecondaryVoucherForGift6(
            job.data.voucherId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    vouchersQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.voucher.queueName}> is stalled`);
    });

    vouchersQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.voucher.queueName}> completed successfully. Result: ${result}`);
    });

    vouchersQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.voucher.queueName}> failed. Error: ${err}`, err);
    });

    vouchersQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.voucher.queueName}>. Error: ${err}`, err);
    });

    vouchersQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.voucher.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    vouchersQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.voucher.queueName}> has started`);
    });

    vouchersQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.voucher.queueName}> paused`);
    });

    vouchersQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.voucher.queueName}> resumed`);
    });

    vouchersQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.voucher.queueName}> removed successfully`);
    });
};

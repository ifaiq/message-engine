/**
* Unsecured Order Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyOrderCreated, notifyOrderCancelled, notifySellerDidnotPayCommission, notifySellerPaidCommission,
    notifyOrderCompleted, remindSellerToPayCommission, revealBuyersInfo,
} from '../notifications/unsecuredOrder.js';

const unsecuredOrderQueue = new Queue(queues.unsecuredOrder.queueName, redis);

export default async () => {
    // Unsecured order created
    unsecuredOrderQueue.process(queues.unsecuredOrder.orderCreated.jobName, async (job, done) => {
        winston.debug(`${queues.unsecuredOrder.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyOrderCreated(
            job.data.orderId,
            job.data.buyerOrderLink,
            job.data.sellerOrderLink,
            job.data.postTitle,
            job.data.isAuction,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Unsecured order cancelled
    unsecuredOrderQueue.process(queues.unsecuredOrder.orderCancelledByUser.jobName, async (job, done) => {
        winston.debug(`${queues.unsecuredOrder.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyOrderCancelled(
            job.data.orderId,
            job.data.buyerOrderLink,
            job.data.sellerOrderLink,
            job.data.cancelledByBuyer,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Unsecured order cancelled as seller didn't pay
    unsecuredOrderQueue.process(queues.unsecuredOrder.sellerDidnotPay.jobName, async (job, done) => {
        winston.debug(`${queues.unsecuredOrder.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerDidnotPayCommission(
            job.data.orderId,
            job.data.buyerOrderLink,
            job.data.sellerOrderLink,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // seller paid commission to reveal buyer
    unsecuredOrderQueue.process(queues.unsecuredOrder.sellerPaid.jobName, async (job, done) => {
        winston.debug(`${queues.unsecuredOrder.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerPaidCommission(
            job.data.orderId,
            job.data.buyerOrderLink,
            job.data.sellerOrderLink,
            job.data.fees,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // order completed
    unsecuredOrderQueue.process(queues.unsecuredOrder.orderCompleted.jobName, async (job, done) => {
        winston.debug(`${queues.unsecuredOrder.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyOrderCompleted(
            job.data.orderId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // reminder for seller to pay commission
    unsecuredOrderQueue.process(queues.unsecuredOrder.payCommissionReminder.jobName, async (job, done) => {
        winston.debug(`${queues.unsecuredOrder.queueName}: Executing job #${job.id}`);
        const { sent, err } = await remindSellerToPayCommission(
            job.data.orderId,
            job.data.orderLink,
            job.data.fees,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // reveal buyer info
    unsecuredOrderQueue.process(queues.unsecuredOrder.revealBuyerInfo.jobName, async (job, done) => {
        winston.debug(`${queues.unsecuredOrder.queueName}: Executing job #${job.id}`);
        const { sent, err } = await revealBuyersInfo(
            job.data.orderId,
            job.data.orderLink,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    unsecuredOrderQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.unsecuredOrder.queueName}> is stalled`);
    });

    unsecuredOrderQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.unsecuredOrder.queueName}> completed successfully. Result: ${result}`);
    });

    unsecuredOrderQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.unsecuredOrder.queueName}> failed. Error: ${err}`, err);
    });

    unsecuredOrderQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${queues.unsecuredOrder.queueName}>. Error: ${err}`, err);
    });

    unsecuredOrderQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.unsecuredOrder.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    unsecuredOrderQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.unsecuredOrder.queueName}> has started`);
    });

    unsecuredOrderQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${queues.unsecuredOrder.queueName}> paused`);
    });

    unsecuredOrderQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${queues.unsecuredOrder.queueName}> resumed`);
    });

    unsecuredOrderQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.unsecuredOrder.queueName}> removed successfully`);
    });
};

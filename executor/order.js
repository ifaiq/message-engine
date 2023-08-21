/**
 * Order Executor
 * @module
 */

import Queue from 'bull';
import winston from 'winston';

import queues from '../models/bull-config/queues.config.js';

import {
    buyNowOrderCreated,
    earlyDroppedOffOrderCreated,
    notifyBuyerPickedUpItem,
    notifyBuyerRejectedItem,
    notifyBuyerSellerDidNotDropOff,
    notifyChooseSP,
    notifyOrderCancelledAtInspection,
    notifyOrderCancelledFromBuyer,
    notifySellerBuyerDidNotPickUp,
    notifySellerDroppedOffItemBuyer,
    notifySellerDroppedOffItemSeller,
    notifyUsersAmountUnlocked,
    orderDelivered,
    orderShipped,
    sendDropOffReceipt,
    sendPickUpReceipt,
} from '../notifications/order.js';
import notifyOrderCancelledByAdmin from '../notifications/orderCancel.js';

import redis from '../startup/redis.js';

const ordersQueue = new Queue(queues.order.queueName, redis);

export default async () => {
    // Amount Unlocked
    ordersQueue.process(queues.order.orderCompleted.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUsersAmountUnlocked(
            job.data.orderId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Seller did not drop off
    ordersQueue.process(queues.order.sellerDidNotDropOff.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBuyerSellerDidNotDropOff(
            job.data.orderId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Buyer did not pick up
    ordersQueue.process(queues.order.buyerDidNotPickUp.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerBuyerDidNotPickUp(
            job.data.orderId,
            job.data.projectXFrontendHost,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Buyer rejected item pick up
    ordersQueue.process(queues.order.buyerRejectedItem.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBuyerRejectedItem(
            job.data.orderId,
            job.data.itemId,
            job.data.projectXFrontendHost,
            job.data.window,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Buyer picked up item
    ordersQueue.process(queues.order.buyerPickedUpItem.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBuyerPickedUpItem(
            job.data.orderId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Seller dropped off item (sent to seller)
    ordersQueue.process(queues.order.sellerDroppedOffItemSeller.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerDroppedOffItemSeller(
            job.data.orderId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // pick up your order (Sent to buyer)
    ordersQueue.process(queues.order.sellerDroppedOffItemBuyer.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerDroppedOffItemBuyer(
            job.data.orderId,
            job.data.projectXFrontendHost,
            job.data.appointmentExists,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Choose SP
    ordersQueue.process(queues.order.chooseSP.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyChooseSP(
            job.data.orderId,
            job.data.userId,
            job.data.userType,
            job.data.host,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Order Cancelled from buyer
    ordersQueue.process(queues.order.orderCancelledFromBuyer.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyOrderCancelledFromBuyer(
            job.data.orderId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Order Cancelled at inspection
    ordersQueue.process(queues.order.orderCancelledAtInspection.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyOrderCancelledAtInspection(
            job.data.orderId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Drop off receipt
    ordersQueue.process(queues.order.dropOffReceipt.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sendDropOffReceipt(
            job.data.orderId,
            job.data.totalAmount,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Pick up receipt
    ordersQueue.process(queues.order.pickUpReceipt.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sendPickUpReceipt(
            job.data.orderId,
            job.data.totalAmount,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Buy Now Order Created
    ordersQueue.process(queues.order.buyNowOrderCreated.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await buyNowOrderCreated(
            job.data.orderIds,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Order Created on Already Early Dropped Off Items
    ordersQueue.process(queues.order.earlyDropOffOrderCreated.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await earlyDroppedOffOrderCreated(
            job.data.orderId,
            job.data.orderLink,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Order dropped off by seller and shipped for delivery
    ordersQueue.process(queues.order.orderShipped.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await orderShipped(
            job.data.orderId,
            job.data.estimatedDeliveryDate,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Order cancelled by Admin
    ordersQueue.process(queues.order.orderCancelledByAdmin.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyOrderCancelledByAdmin(
            job.data.orderId,
            job.data.reason,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Order delivered to buyer
    ordersQueue.process(queues.order.orderDelivered.jobName, async (job, done) => {
        winston.debug(`${queues.order.queueName}: Executing job #${job.id}`);
        const { sent, err } = await orderDelivered(job.data.orderId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    ordersQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.order.queueName}> is stalled`);
    });

    ordersQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.order.queueName}> completed successfully. Result: ${result}`);
    });

    ordersQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.order.queueName}> failed. Error: ${err}`, err);
    });

    ordersQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${queues.order.queueName}>. Error: ${err}`, err);
    });

    ordersQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.order.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    ordersQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.order.queueName}> has started`);
    });

    ordersQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${queues.order.queueName}> paused`);
    });

    ordersQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${queues.order.queueName}> resumed`);
    });

    ordersQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.order.queueName}> removed successfully`);
    });
};

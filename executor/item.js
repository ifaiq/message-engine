/**
 * Item Executor
 * @module
 */

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifySellerDroppedOffItemsEarly,
    notifySellerPickedUpEarlyDroppedOffItems,
    notifyEarlyDropOffAppointmentCancelled,
} from '../notifications/item.js';

//----------------------------------------------------------------------------------
const { queueName } = queues.item;
const itemQueue = new Queue(queueName, redis);

//----------------------------------------------------------------------------------
export default async () => {
    //----------------------------------------------------------------------------------
    // Items Dropped Off Early
    itemQueue.process(queues.item.earlyDropOff.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerDroppedOffItemsEarly(
            job.data.postId,
            job.data.numberOfItems,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    //----------------------------------------------------------------------------------
    // Items Picked Up
    itemQueue.process(queues.item.pickUpEarlyDroppedOff.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerPickedUpEarlyDroppedOffItems(
            job.data.postId,
            job.data.numberOfItems,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    //----------------------------------------------------------------------------------
    // Early drop off appointments cancelled
    itemQueue.process(queues.item.earlyDropOffAppointmentCancelled.jobName, async (job, done) => {
        winston.debug(`${queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyEarlyDropOffAppointmentCancelled(
            job.data.appointmentId,
            job.data.orderCreated,
            job.data.cancelledBySeller,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });
    //----------------------------------------------------------------------------------
    itemQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queueName}> is stalled`);
    });

    itemQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queueName}> completed successfully. Result: ${result}`);
    });

    itemQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queueName}> failed. Error: ${err}`, err);
    });

    itemQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queueName}>. Error: ${err}`, err);
    });

    itemQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queueName}> waiting to be processed as soon as a worker is idling`);
    });

    itemQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queueName}> has started`);
    });

    itemQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queueName}> paused`);
    });

    itemQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queueName}> resumed`);
    });

    itemQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queueName}> removed successfully`);
    });
};

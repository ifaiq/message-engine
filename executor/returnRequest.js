/**
* Return Request Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyBuyerDidNotPickup,
    notifySellerDidNotPickup,
    notifyBuyerDidNotDropOff,
    notifyBuyerDidNotRespond,
    notifySellerDidNotRespondOrRejected,
    notifySellerToPickUp,
    investigationOpened,
    sellerAcceptsItems,
    buyersFault,
    sellersFault,
    sellerPicksUp,
    buyerPicksUp,
    returnRequestCreated,
    sellerAcceptsReturnRequest,
    investigationRequested,
    buyerCancelled,
    commentAccepted,
    commentRejected,
} from '../notifications/returnRequest.js';

const notifyNoShowQueue = new Queue(queues.returnRequest.notifyNoShow.queueName, redis);
const notifyNoResponseOrRejectionQueue = new Queue(queues.returnRequest.notifyNoResponseOrRejection.queueName, redis);
const returnRequestQueue = new Queue(queues.returnRequest.queueName, redis);

export default async () => {
    // Notify Buyer did not pickup
    notifyNoShowQueue.process(queues.returnRequest.notifyNoShow.buyerDidNotPickup.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.notifyNoShow.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBuyerDidNotPickup(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Seller did not pickup
    notifyNoShowQueue.process(queues.returnRequest.notifyNoShow.sellerDidNotPickup.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.notifyNoShow.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerDidNotPickup(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });
    // Notify Buyer did not drop off
    notifyNoShowQueue.process(queues.returnRequest.notifyNoShow.buyerDidNotDropOff.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.notifyNoShow.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBuyerDidNotDropOff(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    notifyNoShowQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoShow.queueName}> is stalled`);
    });

    notifyNoShowQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoShow.queueName}> completed successfully. Result: ${result}`);
    });

    notifyNoShowQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.returnRequest.notifyNoShow.queueName}> failed. Error: ${err}`, err);
    });

    notifyNoShowQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.returnRequest.notifyNoShow.queueName}>. Error: ${err}`, err);
    });

    notifyNoShowQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.returnRequest.notifyNoShow.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    notifyNoShowQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoShow.queueName}> has started`);
    });

    notifyNoShowQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.returnRequest.notifyNoShow.queueName}> paused`);
    });

    notifyNoShowQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.returnRequest.notifyNoShow.queueName}> resumed`);
    });

    notifyNoShowQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoShow.queueName}> removed successfully`);
    });

    //--------------------------------------------------------------------------------------------------------------------------

    // Notify Buyer did not respond
    notifyNoResponseOrRejectionQueue.process(queues.returnRequest.notifyNoResponseOrRejection.buyerDidNotRespond.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.notifyNoResponseOrRejection.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBuyerDidNotRespond(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Buyer did not respond
    notifyNoResponseOrRejectionQueue.process(queues.returnRequest.notifyNoResponseOrRejection.sellerDidNotRespondOrRejected.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.notifyNoResponseOrRejection.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerDidNotRespondOrRejected(job.data.returnReqId, job.data.isRejected, job.data.frontEndHost);
        if (sent) done(null, 'Success');
        else done(err);
    });

    notifyNoResponseOrRejectionQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> is stalled`);
    });

    notifyNoResponseOrRejectionQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> completed successfully. Result: ${result}`);
    });

    notifyNoResponseOrRejectionQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> failed. Error: ${err}`, err);
    });

    notifyNoResponseOrRejectionQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}>. Error: ${err}`, err);
    });

    notifyNoResponseOrRejectionQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    notifyNoResponseOrRejectionQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> has started`);
    });

    notifyNoResponseOrRejectionQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> paused`);
    });

    notifyNoResponseOrRejectionQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> resumed`);
    });

    notifyNoResponseOrRejectionQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.notifyNoResponseOrRejection.queueName}> removed successfully`);
    });

    //--------------------------------------------------------------------------------------------------------------------------

    // Notify Seller To PickUp
    returnRequestQueue.process(queues.returnRequest.notifySellerToPickUp.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerToPickUp(job.data.returnReqId, job.data.host);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Investigation Opened
    returnRequestQueue.process(queues.returnRequest.investigationOpened.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await investigationOpened(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Seller Accepts items
    returnRequestQueue.process(queues.returnRequest.sellerAcceptsItems.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sellerAcceptsItems(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Buyer's Fault
    returnRequestQueue.process(queues.returnRequest.buyersFault.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await buyersFault(job.data.returnReqId, job.data.host);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Seller's fault
    returnRequestQueue.process(queues.returnRequest.sellersFault.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sellersFault(job.data.returnReqId, job.data.host);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Seller PicksUp
    returnRequestQueue.process(queues.returnRequest.sellerPicksUp.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sellerPicksUp(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Buyer PicksUp
    returnRequestQueue.process(queues.returnRequest.buyerPicksUp.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await buyerPicksUp(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Return Request Created
    returnRequestQueue.process(queues.returnRequest.returnRequestCreated.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await returnRequestCreated(job.data.returnReqId, job.data.host);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Seller Accepts Return Request
    returnRequestQueue.process(queues.returnRequest.sellerAcceptsReturnRequest.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sellerAcceptsReturnRequest(job.data.returnReqId, job.data.host);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Investigation Requested
    returnRequestQueue.process(queues.returnRequest.investigationRequested.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await investigationRequested(job.data.returnReqId, job.data.host);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Buyer Cancelled
    returnRequestQueue.process(queues.returnRequest.buyerCancelled.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await buyerCancelled(job.data.returnReqId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Comment Accepted
    returnRequestQueue.process(queues.returnRequest.commentAccepted.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await commentAccepted(job.data.commentReviewId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Comment Rejected
    returnRequestQueue.process(queues.returnRequest.commentRejected.jobName, async (job, done) => {
        winston.debug(`${queues.returnRequest.queueName}: Executing job #${job.id}`);
        const { sent, err } = await commentRejected(job.data.commentReviewId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    returnRequestQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.queueName}> is stalled`);
    });

    returnRequestQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.queueName}> completed successfully. Result: ${result}`);
    });

    returnRequestQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.returnRequest.queueName}> failed. Error: ${err}`, err);
    });

    returnRequestQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.returnRequest.queueName}>. Error: ${err}`, err);
    });

    returnRequestQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.returnRequest.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    returnRequestQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.queueName}> has started`);
    });

    returnRequestQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.returnRequest.queueName}> paused`);
    });

    returnRequestQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.returnRequest.queueName}> resumed`);
    });

    returnRequestQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.returnRequest.queueName}> removed successfully`);
    });
};

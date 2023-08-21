/**
 * Post Executor
 * @module
 */

import Queue from 'bull';
import winston from 'winston';

import queues from '../models/bull-config/queues.config.js';

import * as postNotification from '../notifications/post.js';

import redis from '../startup/redis.js';

//------------------------------------------------------------------------------
const { queueName: postExpiredQueueName } = queues.post.postExpired;
const postExpiredQueue = new Queue(postExpiredQueueName, redis);
const { queueName: recommendPostQueueName } = queues.post.recommendPost;
const recommendPostQueue = new Queue(recommendPostQueueName, redis);
const { queueName: postAuctionQueueName } = queues.post.postAuction;
const postAuctionQueue = new Queue(postAuctionQueueName, redis);
const { queueName: postStatusQueueName } = queues.post.postStatus;
const postStatusQueue = new Queue(postStatusQueueName, redis);
const { queueName: postActionsQueueName } = queues.post.postActions;
const postActionsQueue = new Queue(postActionsQueueName, redis);

//------------------------------------------------------------------------------
export default async () => {
    // Post expired without selling
    postExpiredQueue.process(queues.post.postExpired.withoutSelling.jobName, async (job, done) => {
        winston.debug(`${postExpiredQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostExpiredWithoutSelling(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Post expired with quantity remaining
    postExpiredQueue.process(queues.post.postExpired.withQuantityRemaining.jobName, async (job, done) => {
        winston.debug(`${postExpiredQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostExpiredWithQuantityRemaining(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postExpiredQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${postExpiredQueueName}> is stalled`);
    });

    postExpiredQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${postExpiredQueueName}> completed successfully. Result: ${result}`);
    });

    postExpiredQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${postExpiredQueueName}> failed. Error: ${err}`, err);
    });

    postExpiredQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${postExpiredQueueName}>. Error: ${err}`, err);
    });

    postExpiredQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${postExpiredQueueName}> waiting to be processed as soon as a worker is idling`);
    });

    postExpiredQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${postExpiredQueueName}> has started`);
    });

    postExpiredQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${postExpiredQueueName}> paused`);
    });

    postExpiredQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${postExpiredQueueName}> resumed`);
    });

    postExpiredQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${postExpiredQueueName}> removed successfully`);
    });

    //--------------------------------------------------------------------------
    // Recommend Post
    recommendPostQueue.process(queues.post.recommendPost.recommendPostToPercentageOfUsers.jobName, async (job, done) => {
        winston.debug(`${recommendPostQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyRecommendedPost(
            job.data.postId,
            job.data.userPercentage,
            job.data.englishNotifTitle,
            job.data.englishNotifBody,
            job.data.arabicNotifTitle,
            job.data.arabicNotifBody,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    recommendPostQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${recommendPostQueueName}> is stalled`);
    });

    recommendPostQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${recommendPostQueueName}> completed successfully. Result: ${result}`);
    });

    recommendPostQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${recommendPostQueueName}> failed. Error: ${err}`, err);
    });

    recommendPostQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${recommendPostQueueName}>. Error: ${err}`, err);
    });

    recommendPostQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${recommendPostQueueName}> waiting to be processed as soon as a worker is idling`);
    });

    recommendPostQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${recommendPostQueueName}> has started`);
    });

    recommendPostQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${recommendPostQueueName}> paused`);
    });

    recommendPostQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${recommendPostQueueName}> resumed`);
    });

    recommendPostQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${recommendPostQueueName}> removed successfully`);
    });

    //--------------------------------------------------------------------------
    // Post first bid
    postAuctionQueue.process(queues.post.postAuction.firstBid.jobName, async (job, done) => {
        winston.debug(`${postAuctionQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifySellerWithFirstBid(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Premium post fees paid
    postAuctionQueue.process(queues.post.postAuction.premiumFeesPaid.jobName, async (job, done) => {
        winston.debug(`${postAuctionQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyUserPremiumFeesPaid(
            job.data.postId,
            job.data.userId,
            job.data.dueAmount,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postAuctionQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${postAuctionQueueName}> is stalled`);
    });

    postAuctionQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${postAuctionQueueName}> completed successfully. Result: ${result}`);
    });

    postAuctionQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${postAuctionQueueName}> failed. Error: ${err}`, err);
    });

    postAuctionQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${postAuctionQueueName}>. Error: ${err}`, err);
    });

    postAuctionQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${postAuctionQueueName}> waiting to be processed as soon as a worker is idling`);
    });

    postAuctionQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${postAuctionQueueName}> has started`);
    });

    postAuctionQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${postAuctionQueueName}> paused`);
    });

    postAuctionQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${postAuctionQueueName}> resumed`);
    });

    postAuctionQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${postAuctionQueueName}> removed successfully`);
    });

    //--------------------------------------------------------------------------
    // Post Status
    postStatusQueue.process(queues.post.postStatus.postUnderReview.jobName, async (job, done) => {
        winston.debug(`${postStatusQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostUnderReview(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postStatusQueue.process(queues.post.postStatus.postAccepted.jobName, async (job, done) => {
        winston.debug(`${postStatusQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostAccepted(
            job.data.postId,
            job.data.isNewPost,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postStatusQueue.process(queues.post.postStatus.postRejected.jobName, async (job, done) => {
        winston.debug(`${postStatusQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostRejected(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postStatusQueue.process(queues.post.postStatus.postDeclined.jobName, async (job, done) => {
        winston.debug(`${postStatusQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostDeclined(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postStatusQueue.process(queues.post.postStatus.postAcceptedAuction.jobName, async (job, done) => {
        winston.debug(`${postStatusQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostAcceptedAuction(
            job.data.postId,
            job.data.isNewPost,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postStatusQueue.process(queues.post.postStatus.postReposted.jobName, async (job, done) => {
        winston.debug(`${postStatusQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifySellerPostReposted(
            job.data.postId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postStatusQueue.process(queues.post.postStatus.postDataAppended.jobName, async (job, done) => {
        winston.debug(`${postStatusQueueName}: Executing job #${job.id}`);
        const { sent, err } = await postNotification.notifyPostDataAppendedOutcome(
            job.data.postId,
            job.data.accepted,
            job.data.declineReason,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    postStatusQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${postStatusQueueName}> is stalled`);
    });

    postStatusQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${postStatusQueueName}> completed successfully. Result: ${result}`);
    });

    postStatusQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${postStatusQueueName}> failed. Error: ${err}`, err);
    });

    postStatusQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${postStatusQueueName}>. Error: ${err}`, err);
    });

    postStatusQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${postStatusQueueName}> waiting to be processed as soon as a worker is idling`);
    });

    postStatusQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${postStatusQueueName}> has started`);
    });

    postStatusQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${postStatusQueueName}> paused`);
    });

    postStatusQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${postStatusQueueName}> resumed`);
    });

    postStatusQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${postStatusQueueName}> removed successfully`);
    });

    //--------------------------------------------------------------------------
    // Post Actions
    postActionsQueue.process(
        queues.post.postActions.requestToSwitchSecured.jobName,
        async (job, done) => {
            winston.debug(`${postActionsQueueName}: Executing job #${job.id}`);
            const { sent, err } = await postNotification.notifySellerToSwitchSecured(
                job.data.postId,
                job.data.commission,
            );
            if (sent) done(null, 'Success');
            else done(err);
        },
    );

    postActionsQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${postActionsQueueName}> is stalled`);
    });

    postActionsQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${postActionsQueueName}> completed successfully. Result: ${result}`);
    });

    postActionsQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${postActionsQueueName}> failed. Error: ${err}`, err);
    });

    postActionsQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${postActionsQueueName}>. Error: ${err}`, err);
    });

    postActionsQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${postActionsQueueName}> waiting to be processed as soon as a worker is idling`);
    });

    postActionsQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${postActionsQueueName}> has started`);
    });

    postActionsQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${postActionsQueueName}> paused`);
    });

    postActionsQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${postActionsQueueName}> resumed`);
    });

    postActionsQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${postActionsQueueName}> removed successfully`);
    });
};

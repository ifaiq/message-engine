/**
* Auction Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyAuctionWinner,
    notifySellerAuctionWon,
    notifyHighestBidderItemSold,
    notifyPreviousBidderOutbid,
    notifyBiddersAuctionAboutToEnd,
    notifyBiddersPersonal,
} from '../notifications/auction.js';

const { queueName: auctionWonQueueName } = queues.auction.notifyAuctionWon;
const { queueName: biddersQueueName } = queues.auction.notifyAuctionBidders;

const notifyAuctionWonQueue = new Queue(auctionWonQueueName, redis);
const notifyAuctionBiddersQueue = new Queue(biddersQueueName, redis);

export default async () => {
    //------------------------------------------------------------------------
    // Notify Auction Winner
    notifyAuctionWonQueue.process(queues.auction.notifyAuctionWon.notifyWinner.jobName, async (job, done) => {
        winston.debug(`${auctionWonQueueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyAuctionWinner(job.data.winnerId, job.data.postId, job.data.orderId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Seller Auction Won
    notifyAuctionWonQueue.process(queues.auction.notifyAuctionWon.notifySeller.jobName, async (job, done) => {
        winston.debug(`${auctionWonQueueName}: Executing job #${job.id}`);
        const { sent, err } = await notifySellerAuctionWon(job.data.sellerId, job.data.postId, job.data.orderId, job.data.window);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Highest Bidder Item Sold By Buy Now
    notifyAuctionWonQueue.process(queues.auction.notifyAuctionWon.notifyHighestBidderItemSold.jobName, async (job, done) => {
        winston.debug(`${auctionWonQueueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyHighestBidderItemSold(job.data.auctionId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Previous Bidder Outbid
    notifyAuctionWonQueue.process(queues.auction.notifyAuctionWon.notifyPreviousBidderOutbid.jobName, async (job, done) => {
        winston.debug(`${auctionWonQueueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyPreviousBidderOutbid(job.data.prevHighestBidderId, job.data.actualBidder, job.data.newBid, job.data.postId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Bidders auction about to end
    notifyAuctionWonQueue.process(queues.auction.notifyAuctionWon.notifyBiddersAuctionAboutToEnd.jobName, async (job, done) => {
        winston.debug(`${auctionWonQueueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBiddersAuctionAboutToEnd(job.data.postId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    notifyAuctionWonQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${auctionWonQueueName}> is stalled`);
    });

    notifyAuctionWonQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${auctionWonQueueName}> completed successfully. Result: ${result}`);
    });

    notifyAuctionWonQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${auctionWonQueueName}> failed. Error: ${err}`, err);
    });

    notifyAuctionWonQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${auctionWonQueueName}>. Error: ${err}`, err);
    });

    notifyAuctionWonQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${auctionWonQueueName}> waiting to be processed as soon as a worker is idling`);
    });

    notifyAuctionWonQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${auctionWonQueueName}> has started`);
    });

    notifyAuctionWonQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${auctionWonQueueName}> paused`);
    });

    notifyAuctionWonQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${auctionWonQueueName}> resumed`);
    });

    notifyAuctionWonQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${auctionWonQueueName}> removed successfully`);
    });

    //------------------------------------------------------------------------
    // Notify Auction Bidders with Personal Message
    notifyAuctionBiddersQueue.process(queues.auction.notifyAuctionBidders.notifyBiddersPersonal.jobName, async (job, done) => {
        winston.debug(`${biddersQueueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBiddersPersonal(
            job.data.isPromotionalPost,
            job.data.auctionId,
            job.data.isEmail,
            job.data.emailSubject,
            job.data.emailMessage,
            job.data.isPush,
            job.data.pushTitle,
            job.data.pushBody,
            job.data.isSMS,
            job.data.smsMessage,
            job.data.smsService,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    notifyAuctionBiddersQueue.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${biddersQueueName}> is stalled`);
    });

    notifyAuctionBiddersQueue.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${biddersQueueName}> completed successfully. Result: ${result}`);
    });

    notifyAuctionBiddersQueue.on('failed', (job, err) => {
        // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${biddersQueueName}> failed. Error: ${err}`, err);
    });

    notifyAuctionBiddersQueue.on('error', (err) => {
        // An error occurred.
        winston.error(`Error in queue <${biddersQueueName}>. Error: ${err}`, err);
    });

    notifyAuctionBiddersQueue.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${biddersQueueName}> waiting to be processed as soon as a worker is idling`);
    });

    notifyAuctionBiddersQueue.on('active', (job) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${biddersQueueName}> has started`);
    });

    notifyAuctionBiddersQueue.on('global:paused', () => {
        // The queue has been paused.
        winston.debug(`Queue <${biddersQueueName}> paused`);
    });

    notifyAuctionBiddersQueue.on('global:resumed', () => {
        // The queue has been resumed.
        winston.debug(`Queue <${biddersQueueName}> resumed`);
    });

    notifyAuctionBiddersQueue.on('global:removed', (job) => {
        // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${biddersQueueName}> removed successfully`);
    });
};

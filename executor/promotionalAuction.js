/**
* Promotional Auction Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyPromotionalAuctionWinner,
    notifyPreviousBidderOutbid,
    notifyBiddersPromotionalAuctionAboutToEnd,
} from '../notifications/promotionalAuction.js';

const notifyPromotionalAuctionWonQueue = new Queue(queues.promotionalAuction.notifyPromotionalAuctionWon.queueName, redis);

export default async () => {
    // Notify Promotional Auction Winner
    notifyPromotionalAuctionWonQueue.process(queues.promotionalAuction.notifyPromotionalAuctionWon.notifyWinner.jobName, async (job, done) => {
        winston.debug(`${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyPromotionalAuctionWinner(job.data.winnerId, job.data.postId, job.data.brandName);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Previous Bidder Outbid
    notifyPromotionalAuctionWonQueue.process(queues.promotionalAuction.notifyPromotionalAuctionWon.notifyPreviousBidderOutbid.jobName, async (job, done) => {
        winston.debug(`${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyPreviousBidderOutbid(job.data.prevHighestBidderId, job.data.newBid, job.data.auctionId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify Bidders Promotional auction about to end
    notifyPromotionalAuctionWonQueue.process(queues.promotionalAuction.notifyPromotionalAuctionWon.notifyBiddersPromotionalAuctionAboutToEnd.jobName, async (job, done) => {
        winston.debug(`${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyBiddersPromotionalAuctionAboutToEnd(job.data.postId);
        if (sent) done(null, 'Success');
        else done(err);
    });

    notifyPromotionalAuctionWonQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> is stalled`);
    });

    notifyPromotionalAuctionWonQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> completed successfully. Result: ${result}`);
    });

    notifyPromotionalAuctionWonQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> failed. Error: ${err}`, err);
    });

    notifyPromotionalAuctionWonQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}>. Error: ${err}`, err);
    });

    notifyPromotionalAuctionWonQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    notifyPromotionalAuctionWonQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> has started`);
    });

    notifyPromotionalAuctionWonQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> paused`);
    });

    notifyPromotionalAuctionWonQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> resumed`);
    });

    notifyPromotionalAuctionWonQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.promotionalAuction.notifyPromotionalAuctionWon.queueName}> removed successfully`);
    });
};

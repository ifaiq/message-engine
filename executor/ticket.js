/**
* Ticket Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import notifyTicketReply from '../notifications/ticket.js';

const ticketQueue = new Queue(queues.ticket.queueName, redis);

export default async () => {
    // Ticket response
    ticketQueue.process(queues.ticket.ticketReply.jobName, async (job, done) => {
        winston.debug(`${queues.ticket.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyTicketReply(
            job.data.email,
            job.data.subject,
            job.data.reply,
            job.data.language,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    ticketQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.ticket.queueName}> is stalled`);
    });

    ticketQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.ticket.queueName}> completed successfully. Result: ${result}`);
    });

    ticketQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.ticket.queueName}> failed. Error: ${err}`, err);
    });

    ticketQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.ticket.queueName}>. Error: ${err}`, err);
    });

    ticketQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.ticket.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    ticketQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.ticket.queueName}> has started`);
    });

    ticketQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.ticket.queueName}> paused`);
    });

    ticketQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.ticket.queueName}> resumed`);
    });

    ticketQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.ticket.queueName}> removed successfully`);
    });
};

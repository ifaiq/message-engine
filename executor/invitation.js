/**
 * Invitation Executor
 * @module
 */

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    sendInvitationByMail,
} from '../notifications/invitation.js';

const { invitation } = queues;

const mailInvitationQueue = new Queue(invitation.mailInvitation.queueName, redis);

export default async () => {
    //---------------------------------------------------------------------------------------------------------------
    // Send invitation Mail
    mailInvitationQueue.process(invitation.mailInvitation.sendInvitationByMail.jobName, async (job, done) => {
        winston.debug(`${invitation.mailInvitation.queueName}: Executing job #${job.id}`);
        const { sent, err } = await sendInvitationByMail(
            job.data.invitationId,
            job.data.brandName,
            job.data.host,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    mailInvitationQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${invitation.mailInvitation.queueName}> is stalled`);
    });

    mailInvitationQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${invitation.mailInvitation.queueName}> completed successfully. Result: ${result}`);
    });

    mailInvitationQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${invitation.mailInvitation.queueName}> failed. Error: ${err}`, err);
    });

    mailInvitationQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${invitation.mailInvitation.queueName}>. Error: ${err}`, err);
    });

    mailInvitationQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${invitation.mailInvitation.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    mailInvitationQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${invitation.mailInvitation.queueName}> has started`);
    });

    mailInvitationQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${invitation.mailInvitation.queueName}> paused`);
    });

    mailInvitationQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${invitation.mailInvitation.queueName}> resumed`);
    });

    mailInvitationQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${invitation.mailInvitation.queueName}> removed successfully`);
    });
};

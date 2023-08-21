/**
* Admin Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import { adminResetPassword, adminReportProblem } from '../notifications/admin.js';

const adminQueue = new Queue(queues.admin.queueName, redis);

export default async () => {
    // Admin password reset
    adminQueue.process(queues.admin.adminPasswordReset.jobName, async (job, done) => {
        winston.debug(`${queues.admin.queueName}: Executing job #${job.id}`);
        const { sent, err } = await adminResetPassword(
            job.data.adminId,
            job.data.host,
            job.data.token,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Problems reports
    adminQueue.process(queues.admin.adminReportProblem.jobName, async (job, done) => {
        winston.debug(`${queues.admin.queueName}: Executing job #${job.id}`);
        const { sent, err } = await adminReportProblem(
            job.data.reportObj,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    adminQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.admin.queueName}> is stalled`);
    });

    adminQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.admin.queueName}> completed successfully. Result: ${result}`);
    });

    adminQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.admin.queueName}> failed. Error: ${err}`, err);
    });

    adminQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.admin.queueName}>. Error: ${err}`, err);
    });

    adminQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.admin.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    adminQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.admin.queueName}> has started`);
    });

    adminQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.admin.queueName}> paused`);
    });

    adminQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.admin.queueName}> resumed`);
    });

    adminQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.admin.queueName}> removed successfully`);
    });
};

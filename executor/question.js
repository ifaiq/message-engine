/**
* Question Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import {
    notifyUserAnswerDisapproved,
    notifyUserQuestionDisapproved,
    notifyUserWithQuestionOnHisPost,
    notifyQuestionFollowers,
} from '../notifications/question.js';

const qaQueue = new Queue(queues.qa.queueName, redis);

export default async () => {
    // Answer disapproved
    qaQueue.process(queues.qa.answer.disapproved.jobName, async (job, done) => {
        winston.debug(`${queues.qa.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserAnswerDisapproved(
            job.data.answerId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Question disapproved
    qaQueue.process(queues.qa.question.disapproved.jobName, async (job, done) => {
        winston.debug(`${queues.qa.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserQuestionDisapproved(
            job.data.questionId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Question approved
    qaQueue.process(queues.qa.question.approved.jobName, async (job, done) => {
        winston.debug(`${queues.qa.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserWithQuestionOnHisPost(
            job.data.userId,
            job.data.postId,
            job.data.questionId,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    // Notify question followers
    qaQueue.process(queues.qa.question.notifyFollowers.jobName, async (job, done) => {
        winston.debug(`${queues.qa.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyQuestionFollowers(
            job.data.questionId,
            job.data.answerFromAdmin,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    qaQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.qa.queueName}> is stalled`);
    });

    qaQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.qa.queueName}> completed successfully. Result: ${result}`);
    });

    qaQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.qa.queueName}> failed. Error: ${err}`, err);
    });

    qaQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.qa.queueName}>. Error: ${err}`, err);
    });

    qaQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.qa.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    qaQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.qa.queueName}> has started`);
    });

    qaQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.qa.queueName}> paused`);
    });

    qaQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.qa.queueName}> resumed`);
    });

    qaQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.qa.queueName}> removed successfully`);
    });
};

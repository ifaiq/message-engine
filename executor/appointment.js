/**
* Appointment Executor
* @module
*/

import winston from 'winston';
import Queue from 'bull';
import redis from '../startup/redis.js';
import queues from '../models/bull-config/queues.config.js';
import { notifyUserToScheduleAppointment, notifyUserAppointmentComingSoon } from '../notifications/appointment.js';

const scheduleAppointmentQueue = new Queue(queues.appointment.schedule.queueName, redis);
const appointmentComingSoonQueue = new Queue(queues.appointment.comingSoon.queueName, redis);

export default async () => {
    // Scheduling Appointments
    scheduleAppointmentQueue.process('*', async (job, done) => {
        winston.debug(`${queues.appointment.schedule.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserToScheduleAppointment(
            job.data.userId,
            job.data.requestId,
            job.data.requestEsId,
            job.data.requestType,
            job.data.requestKey,
            job.data.userType,
            job.data.actionType,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    scheduleAppointmentQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.schedule.queueName}> is stalled`);
    });

    scheduleAppointmentQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.schedule.queueName}> completed successfully. Result: ${result}`);
    });

    scheduleAppointmentQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.appointment.schedule.queueName}> failed. Error: ${err}`, err);
    });

    scheduleAppointmentQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.appointment.schedule.queueName}>. Error: ${err}`, err);
    });

    scheduleAppointmentQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.appointment.schedule.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    scheduleAppointmentQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.schedule.queueName}> has started`);
    });

    scheduleAppointmentQueue.on('paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.appointment.schedule.queueName}> paused`);
    });

    scheduleAppointmentQueue.on('resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.appointment.schedule.queueName}> resumed`);
    });

    scheduleAppointmentQueue.on('removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.schedule.queueName}> removed successfully`);
    });

    // Coming Soon Appointments
    appointmentComingSoonQueue.process('*', async (job, done) => {
        winston.debug(`${queues.appointment.comingSoon.queueName}: Executing job #${job.id}`);
        const { sent, err } = await notifyUserAppointmentComingSoon(
            job.data.userId,
            job.data.requestId,
            job.data.requestEsId,
            job.data.requestType,
            job.data.requestKey,
            job.data.userType,
            job.data.actionType,
        );
        if (sent) done(null, 'Success');
        else done(err);
    });

    appointmentComingSoonQueue.on('stalled', (job) => {
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.comingSoon.queueName}> is stalled`);
    });

    appointmentComingSoonQueue.on('completed', (job, result) => {
    // A job successfully completed with a `result`.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.comingSoon.queueName}> completed successfully. Result: ${result}`);
    });

    appointmentComingSoonQueue.on('failed', (job, err) => {
    // A job failed with reason `err`!
        winston.error(`Job #${job.id} in queue <${queues.appointment.comingSoon.queueName}> failed. Error: ${err}`, err);
    });

    appointmentComingSoonQueue.on('error', (err) => {
    // An error occurred.
        winston.error(`Error in queue <${queues.appointment.comingSoon.queueName}>. Error: ${err}`, err);
    });

    appointmentComingSoonQueue.on('waiting', (jobId) => {
    // A Job is waiting to be processed as soon as a worker is idling.
        winston.debug(`Job #${jobId} in queue <${queues.appointment.comingSoon.queueName}> waiting to be processed as soon as a worker is idling`);
    });

    appointmentComingSoonQueue.on('active', (job) => {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.comingSoon.queueName}> has started`);
    });

    appointmentComingSoonQueue.on('global:paused', () => {
    // The queue has been paused.
        winston.debug(`Queue <${queues.appointment.comingSoon.queueName}> paused`);
    });

    appointmentComingSoonQueue.on('global:resumed', () => {
    // The queue has been resumed.
        winston.debug(`Queue <${queues.appointment.comingSoon.queueName}> resumed`);
    });

    appointmentComingSoonQueue.on('global:removed', (job) => {
    // A job successfully removed.
        winston.debug(`Job #${job.id} in queue <${queues.appointment.comingSoon.queueName}> removed successfully`);
    });
};

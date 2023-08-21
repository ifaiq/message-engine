/**
* Admin Notifications
* @module
*/

import winston from 'winston';
import moment from 'moment';
import config from 'config';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendEmail from '../misc/sendEmail.js';
import Admin from '../models/admin.js';

async function adminResetPassword(adminId, host, token) {
    try {
        const admin = await Admin.findById(adminId).select('name email language').lean();
        if (isEmpty(admin)) {
            const error = new Error(`Admin with ID <${adminId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const link = `${host}password/reset/${token}?lang=${admin.language}`;

        // Admin is not in Users collection, thus no userId and sendMail function was called directly instead of sendNotification
        await sendEmail(
            admin.email,
            messages[admin.language].admin.resetPasswordMailSubject,
            messages[admin.language].admin.resetPasswordMailBody(admin.name, link),
            admin.language,
        );

        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

/**
 * @description This executor is responsible for sending urgent bugs.
 * @param {String} reportObj.reporterId         - The person who reported the bug
 * @param {String} reportObj.section            - Section
 * @param {String} reportObj.description        - A complete Description of the bug
 * @param {Array<String>} reportObj.images      - Images links
 * @param {Array<String>} reportObj.videos      - Videos Provided for the bug
 * @returns {Promise<{ sent: Boolean, err?: object }>} Result of if mail is sent or not.
*/

async function adminReportProblem(reportObj) {
    try {
        const admin = await Admin.findById(reportObj.reporterId).select('name email language').lean();
        if (isEmpty(admin)) {
            const error = new Error(`Admin with ID <${reportObj.reporterId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const mailSubject = `Report from ${admin.name} - ${reportObj.section} - ${moment(reportObj.createdAt).format('DD-MM-YYYY')}`;
        const storageHost = config.get('storage_host');
        const containerName = config.get('reports.containerName');
        const emailPhotos = reportObj
            .images
            .map((img, index) => `<a href="${storageHost}${containerName}/${img}">Image ${index + 1}</a>`)
            .join('\n');
        const emailVideos = reportObj
            .videos
            .map((vid, index) => `<a href="${storageHost}${containerName}/${vid}">Video ${index + 1}</a>`)
            .join('\n');
        const mailContent = `${reportObj.description}\n${emailPhotos}\n${emailVideos}`;
        const infoMail = config.get('reports_mail');

        await sendEmail(
            infoMail,
            mailSubject,
            mailContent,
            admin.language,
        );

        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    adminResetPassword,
    adminReportProblem,
};

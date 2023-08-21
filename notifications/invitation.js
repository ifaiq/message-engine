/**
* Invitation Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendEmail from '../misc/sendEmail.js';
import Admin from '../models/admin.js';
import Invitation from '../models/invitation.js';
import User from '../models/user.js';

async function sendInvitationByMail(invitationId, brandName, host) {
    try {
        const invitation = await Invitation.findById(invitationId).select('inviteeEmail createdBy token language inviter').lean();
        if (isEmpty(invitation)) {
            const error = new Error(`Invitation with ID <${invitationId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (!invitation.token) {
            const error = new Error(`Invitation with ID <${invitationId}> has no token`);
            winston.error(error);
            return { sent: false, err: error };
        }

        if (!invitation.inviteeEmail) {
            const error = new Error(`Invitation with ID <${invitationId}> has no inviteeEmail`);
            winston.error(error);
            return { sent: false, err: error };
        }

        let mailBody;
        let mailSubject;
        const language = invitation.language ? invitation.language : 'en';
        const link = `${host}register?token=${invitation.token}&lang=${language}`;
        if (invitation.createdBy === 'user') {
            const user = await User.findById(invitation.inviter).select('username').lean();
            if (isEmpty(user)) {
                const error = new Error(`Inviter with ID <${invitation.inviter}> user not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            mailBody = messages[language].invitation.sendInvitationByMailMailBody(user.username, link);
            mailSubject = messages[language].invitation.sendInvitationByMailMailSubject(user.username, brandName);
        } else {
            const admin = await Admin.findById(invitation.inviter).select('_id').lean();
            if (isEmpty(admin)) {
                const error = new Error(`Inviter with ID <${invitation.inviter}> admin not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            mailBody = messages[language].invitation.sendInvitationByMailFromAdminMailBody(link);
            mailSubject = messages[language].invitation.sendInvitationByMailFromAdminMailSubject(brandName);
        }
        // called sendemail directly because invitee is not a user
        await sendEmail(
            invitation.inviteeEmail,
            mailSubject,
            mailBody,
            language,
        );

        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    sendInvitationByMail,
};

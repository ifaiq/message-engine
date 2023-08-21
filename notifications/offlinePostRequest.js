/**
 * Offline Post Request Notifications
 * @module
 */

import config from 'config';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import isValidObjectId from '../misc/isValidObjectId.js';
import sendEmail from '../misc/sendEmail.js';
import User from '../models/user.js';

async function offlineRequestCreated(userId, addressObj, type) {
    try {
        if (!isValidObjectId(userId)) {
            const error = new Error('invalid user object Id');
            return { sent: false, err: error };
        }
        if (isEmpty(addressObj)) {
            const error = new Error('user data or address can not be empty');
            return { sent: false, err: error };
        }
        const user = await User.findById(userId).select('username phone.number').lean();
        const phone = user.phone.number.slice(1);
        user.phone.number = `00${phone}`;
        const valetSubject = messages.ar.valet.subject;
        const valetBody = messages.ar.valet.body(user, addressObj);
        const PPsSubject = messages.ar.pickPackAndShip.subject;
        const PPsBody = messages.ar.pickPackAndShip.body(user, addressObj);

        let subject = type === 'valet' ? valetSubject : PPsSubject;
        const body = type === 'valet' ? valetBody : PPsBody;
        const email = type === 'valet' ? config.get('valetRequestEmail') : config.get('PPSRequestEmail');
        if (process.env.NODE_ENV === 'development') {
            subject = `dev-${subject}`;
        }
        await sendEmail(
            email,
            subject,
            body,
            'ar',
        );
        return { sent: true };
    } catch (error) {
        return { sent: false, err: error };
    }
}
export default offlineRequestCreated;

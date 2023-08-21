import mongoose from 'mongoose';
import config from 'config';
import timeConverter from '../misc/timeConverter.js';

const tokenSchema = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required() { return (this.type === 'emailOTP' || this.type === 'emailVerificationToken' || this.type === 'RESTPASSWORD'); },
        ref: 'User',
    },
    _adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required() { return (this.type === 'adminRESTPASSWORD'); },
        ref: 'Admin',
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires() {
            if (this.type === 'invitationToken') return (timeConverter(config.get('invitation.invitationExpiryTime'), 'days') / 1000); // expires in 1 day, divide by 1000 to return seconds
            if (this.type === 'emailOTP') return (timeConverter(config.get('otpEmailVerificationPeriod'), 'minutes') / 1000); // convert to seconds
            return (timeConverter(config.get('mail.emailVerificationTime'), 'days') / 1000); // 12 hours
        },
    },
    type: {
        type: String,
        default: 'emailVerificationToken',
        enum: ['RESTPASSWORD', 'invitationToken', 'emailVerificationToken', 'adminRESTPASSWORD', 'emailOTP'],
    },
    inviteeEmail: {
        type: String,
        minlength: 5,
        maxlength: 255,
        required() { return this.type === 'invitationToken'; },
    },
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;

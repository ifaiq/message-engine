import mongoose from 'mongoose';
import isValidPhoneNumber from './utils/isValidPhoneNumber.js';

const phoneInvitationSchema = new mongoose.Schema(
    {
        inviter: {
            type: mongoose.Schema.Types.ObjectId,
            ref() {
                if (this.createdBy === 'user') return 'User';
                return 'Admin';
            },
            required: true,
            index: true,
        },
        createdBy: {
            type: String,
            default: 'user',
            enum: ['admin', 'user'],
        },
        invitee: {
            number: {
                type: String,
                validate: {
                    validator: (v) => isValidPhoneNumber(v),
                    message: (props) => `${props.value} is not a valid phone number.`,
                },
            },
            name: {
                type: String,
            },
        },
        token: {
            type: String,
        },
        status: {
            type: String,
            enum: ['active', 'used', 'expired'],
            default: 'active',
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        resendCounter: {
            type: Number,
            default: 0,
        },
        language: {
            type: String,
            enum: ['en', 'ar'],
            default: 'en',
        },
    },
    { timestamps: true },
);
const PhoneInvitation = mongoose.model('PhoneInvitation', phoneInvitationSchema);

export default PhoneInvitation;

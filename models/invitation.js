import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
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
        inviteeEmail: {
            type: String,
            minlength: 5,
            maxlength: 255,
            index: true,
        },
        token: {
            type: String,
        },
        resendCounter: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'used', 'expired'],
            default: 'active',
            required: true,
        },
        expiryDate: {
            type: Date,
        },
        language: {
            type: String,
            enum: ['en', 'ar'],
            default: 'en',
        },
    },
    { timestamps: true },
);

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;

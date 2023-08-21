import mongoose from 'mongoose';

const userTokensSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        chatToken: {
            type: String,
            index: true,
        },
        devices: [{
            deviceId: {
                type: String,
                required: true,
                index: true,
            },
            refreshToken: {
                token: {
                    type: String,
                },
                expiryDate: {
                    type: Date,
                },
            },
            logoutToken: {
                type: String,
                index: true,
            },
            notificationToken: {
                platform: { type: String, enum: ['ios', 'android', 'web'] },
                token: { type: String },
            },
        }],
        topics: [{ type: String }],
        notificationTypesChoices: [{
            notificationType: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'NotificationType',
            },
            choice: {
                email: Boolean,
                push: Boolean,
                sms: Boolean,
            },
        }],
    },
    { timestamps: true },
);

const UserTokens = mongoose.model('UserTokens', userTokensSchema);

export default UserTokens;

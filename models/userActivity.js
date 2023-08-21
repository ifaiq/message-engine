import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    loggedInAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    loggedOutAt: {
        type: Date,
    },
    expiry: {
        type: Date,
    },
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;

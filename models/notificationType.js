import mongoose from 'mongoose';

/**
 * NotificationType
 */
const notificationTypeSchema = new mongoose.Schema({
    /**
     * The unique name of the notificationType
     */
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    /**
     * The default preferences of this notificationType,
     * this is used when the corresponding forceDefault
     * is set to `true` or when the user has no choice.
     */
    defaultPreferences: {
        email: {
            type: Boolean,
            default: true,
            required: true,
        },
        push: {
            type: Boolean,
            default: true,
            required: true,
        },
        sms: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    /**
     * This indicates whether to discard user choice and force
     * the corresponding preference to the default or not.
     */
    forceDefault: {
        email: {
            type: Boolean,
            default: true,
            required: true,
        },
        push: {
            type: Boolean,
            default: true,
            required: true,
        },
        sms: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    /**
     * This is indicates whether the admin can change
     * the defaultPreferences and forceDefault.
     */
    canAdminChange: {
        email: {
            type: Boolean,
            default: true,
            required: true,
        },
        push: {
            type: Boolean,
            default: true,
            required: true,
        },
        sms: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    /**
     * indicates that at least one notification mean has to be true
     */
    requiresAtLeastOneMean: {
        type: Boolean,
        default: false,
    },
});

const NotificationType = mongoose.model('NotificationType', notificationTypeSchema);

export default NotificationType;

/**
 * @description - This model is responsible for saving reports of bugs data, and details about it.
*/
import mongoose from 'mongoose';

export const reportStatuses = ['closed', 'pending', 'not-bug', 'fixed', 'in-progress'];
export const platformEnums = ['ios', 'web', 'android', 'general'];
export const sectionsEnums = [
    'admins',
    'appointments',
    'categories',
    'checkoutcounter',
    'contactus',
    'daydeals',
    'entrancecounter',
    'faqs',
    'general',
    'holidays',
    'home',
    'idverification',
    'inspection',
    'invitationrequests',
    'multiservicepoint',
    'notificationsqueues',
    'orders',
    'otp',
    'platformwallet',
    'posts',
    'problematiccustomers',
    'qas',
    'qr',
    'returnrequests',
    'serve',
    'shareablelinks',
    'specialauctions',
    'storage',
    'storagearea',
    'textreviews',
    'tickets',
    'users',
    'usertransactions',
    'userverificationreview',
    'voucher',
    'wallets',
];

const reportsSchema = new mongoose.Schema(
    {
        /**
         * @description - The user who made the bug.
        */
        reporterId: {
            type: mongoose.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        /**
         * @description - Where the error happened exactly
        */
        section: {
            type: String,
            enum: sectionsEnums,
            required: true,
        },
        /**
         * @description - The platform issue happened in.
         */
        platform: {
            type: String,
            enum: platformEnums,
            required: true,
        },
        /**
         * @description - Somehow complete narrative of the bug and how to reproduce it.
         */
        description: {
            type: String,
            minlength: 5,
            required: true,
        },
        /**
         * @description - Images of the bug to make it more clear (optional)
         */
        images: [{ type: String }],
        /**
         * @description - Videos on how the bug happened (optional)
         */
        videos: [{ type: String }],
        /**
         * @description - Status of the bug to filter them
         */
        status: {
            type: String,
            enum: reportStatuses,
            default: 'pending',
        },
    },
    { timestamps: true },
);

export const ArchivedReports = mongoose.model('ArchivedReports', reportsSchema);

/**
* @description - This function is responsible for moving closed bugs to archived collection
* to make it more clear when searching in important and opened bugs
*/
reportsSchema.post('save', async function () {
    if (this.status === 'closed' || this.status === 'not-bug') {
        await ArchivedReports.bulkWrite([{ insertOne: { document: this } }]);
        await this.remove();
    }
});

const Report = mongoose.model('Reports', reportsSchema);

export default Report;

import mongoose from 'mongoose';
/* order
1- seller pick up
2- buyer drop off
3- seller pickup

*/

/* post
post sold >> some one checkout order
post moved to available
*/

/* return request
 return request opened
 return request accepted
 actions : dropoff - pickup
*/
// transaction types in arabic and english

const transactionEnums = [
    'Boost',
    'Delivery Fees',
    'Deposit',
    'Fees',
    'Invitation Gift',
    'Penalty',
    'Post Gift',
    'Premium',
    'Promotion',
    'Purchase',
    'Rejection',
    'Return',
    'Revenue',
    'StorageFees',
    'Voucher',
    'Withdrawal',
    'إرجاع',
    'إيداع',
    'سحب',
    'شراء',
    'عائد',
    'عرض تسويق',
    'عرض',
    'عقوبة',
    'قسيمة الشراء',
    'مرفوض',
    'مزاد ممتاز',
    'مصاريف تخزين',
    'مصاريف توصيل',
    'مصاريف',
    'هدية المنشور',
    'هدية دعوة',
];

// --------------------------------------------------------------------------------------
const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'appointment',
            'appointment-coming',
            'appointment-schedule',
            'bid',
            'coin',
            'commission',
            'generic',
            'gift',
            'invitation',
            'multiple-orders',
            'order',
            'post',
            'question',
            'return',
            'review',
            'shareableLink',
            'shoppingCart',
            'special',
            'transaction',
            'userProfile',
            'watchlist',
            'action',
            'chat',
        ],
    },

    body: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
    },
    userType: { type: String, enum: ['buyer', 'seller'] },
    actionType: { type: String, enum: ['pickUp', 'dropOff'] },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required() { return (!this.anonymousUser); },
        index: true,
    },
    anonymousUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnonymousUser',
        required() { return (!this.user); },
        index: true,
    },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        index: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        index: true,
    },
    returnRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnRequest',
        index: true,
    },
    promotionalPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromotionalPost',
        index: true,
    },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    gift: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },
    badgeRead: {
        type: Boolean,
        default: false,
    },
    appBadgeRead: {
        type: Boolean,
        default: false,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    transaction: {
        focusType: { type: String, enum: transactionEnums },
        focusId: { type: mongoose.Schema.Types.ObjectId },
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
notificationSchema.pre('save', function run(next) {
    this.wasNew = this.isNew;
    next();
});

// a new model to save old notifications
const ArchivedNotification = mongoose.model('ArchivedNotification', notificationSchema);

const notificationModelName = 'Notification';
// if a new notification is saved for a user
// if this user has more than 25 notifications
// move first created notification from notifications to archived notification
const notificationLimit = 25;
notificationSchema.post('save', async (doc, next) => {
    if (doc.wasNew) {
        const notifications = await mongoose.model(notificationModelName, notificationSchema).find({ user: doc.user })
            .sort({ createdAt: 1 });
        if (notifications.length > notificationLimit) {
            // remove the first created document for this user
            const notificationToRemove = notifications[0];
            const archivedNotification = await ArchivedNotification.exists({ _id: notificationToRemove._id });
            // add first created document to archived notifications
            // only if not exists in case of the first created notification was already added but the deletion from notifications failed
            // so add only if not exists to prevent duplicate keys
            if (!archivedNotification) {
                await ArchivedNotification.bulkWrite([
                    { insertOne: { document: notificationToRemove } },
                ]);
            }
            // remove from notifications
            await mongoose.model(notificationModelName, notificationSchema).deleteOne({ _id: notificationToRemove._id });
        }
    } else if (doc.deleted) {
        await ArchivedNotification.bulkWrite([
            { insertOne: { document: doc } },
        ]);
        await mongoose.model(notificationModelName, notificationSchema).deleteOne({ _id: doc._id });
    }

    return next();
});
const Notification = mongoose.model(notificationModelName, notificationSchema);

export { notificationLimit, ArchivedNotification };
export default Notification;

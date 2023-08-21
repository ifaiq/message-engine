/**
 * Actions Todo List model
 * @description Actions that are needed to be taken to complete the selling or buying cycles
 * @module ActionTodoList
 */
import mongoose from 'mongoose';
import setActionIcon from './utils/actionIcons.js';

const actionsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['generic', 'order', 'post', 'special', 'bid', 'return', 'appointment', 'appointment-schedule', 'appointment-coming', 'transaction', 'coin', 'invitation', 'shoppingCart', 'watchlist', 'shareableLink', 'userProfile', 'question', 'multiple-orders', 'gift', 'commission'],
    },
    body: {
        en: {
            type: String,
            required: true,
        },
        ar: {
            type: String,
            required: true,
        },
    },
    title: {
        en: {
            type: String,
            required: true,
        },
        ar: {
            type: String,
            required: true,
        },
    },
    status: {
        type: String,
        required: true,
        enum: ['unread', 'read', 'completed', 'expired', 'cancelled'],
        default: 'unread',
        index: true,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    expireAt: {
        type: Date,
    },
    userType: { type: String, enum: ['buyer', 'seller', 'generic'] },
    actionType: { type: String, enum: ['pickUp', 'dropOff', 'sellerDecision', 'buyerResponse', 'reviewOrder', 'completeData'] },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
    },
    iconPath: { type: String },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    returnRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ReturnRequest' },
    promotionalPost: { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionalPost' },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    gift: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },
    checkout: { type: mongoose.Schema.Types.ObjectId, ref: 'Checkout' },
}, { timestamps: true });

// a new model to save cancelled, completed or expired actions
const ArchivedActionsToDoList = mongoose.model('ArchivedActionsToDoList', actionsSchema);

// if action status = cancelled, completed or expired
// remove it from actionsTodoList
// add it to archivedActionsToDoList
actionsSchema.post('save', async function next() {
    if (this.status === 'cancelled' || this.status === 'expired' || this.status === 'completed') {
        await ArchivedActionsToDoList.bulkWrite([
            { insertOne: { document: this } },
        ]);
        await this.remove();
    }
});

actionsSchema.pre('save', function run(next) {
    if (!this.iconPath) {
        this.iconPath = setActionIcon(this.type, this.actionType, this.title.en);
    }
    next();
});
const ActionsTodolist = mongoose.model('ActionsTodolist', actionsSchema);

export { ArchivedActionsToDoList };
export default ActionsTodolist;

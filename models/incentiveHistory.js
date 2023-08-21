import mongoose from 'mongoose';
import User from './user.js';

const actionEnums = ['Post'];
const statusEnums = ['Pending', 'Completed', 'Cancelled'];
const incentiveSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    // in case this incentive is repetitive
    iterative: {
        type: Boolean,
        required: true,
        default: false,
    },
    from: {
        type: Date,
        required() {
            return !this.preTakenAction;
        },
    },
    to: {
        type: Date,
        required: true,

    },
    // if need prev incentive GET start time from it
    preTakenAction: {
        type: String,
        required() {
            return !this.from;
        },
    },
    status: {
        type: String,
        enum: statusEnums,
        required: true,

    },
    action: {
        type: String,
        enum: actionEnums,
        required() {
            return this.actionId;
        },
    },
    actionId: {
        type: mongoose.Schema.Types.ObjectId,
        required() {
            return this.action;
        },
        refPath: 'action',
    },

}, { timestamps: true });

const incentiveHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: User,
        required: true,
        unique: true,
    },
    incentives: [incentiveSchema],
});
const IncentiveHistory = mongoose.model('Incentive', incentiveHistorySchema);

export default IncentiveHistory;

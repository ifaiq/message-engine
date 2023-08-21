import mongoose from 'mongoose';
import Incentive from './incentiveHistory.js';

const depositRequestSchema = new mongoose.Schema({
    esId: {
        // This is an id that is specifically done to be indexed in elasticSearch
        type: Number,
        es_indexed: true,
        es_type: 'keyword',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        min: 1,
        required: true,
    },
    SP: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicePoint',
        required() {
            return this.paymentMethod === 'SP';
        },
    },
    timeslot: {
        type: Date,
        required() {
            return this.paymentMethod === 'SP';
        },
    },
    expiryDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['opened', 'canceled', 'completed'],
        default: 'opened',
    },
    paymentMethod: {
        type: String,
        default: 'SP',
        enum: ['SP', 'Voucher', 'Paytabs', 'Incentive'],
    },
    voucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        required() {
            return this.paymentMethod === 'Voucher';
        },
        index: true,
    },
    incentive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Incentive,
        required() {
            return this.paymentMethod === 'Incentive';
        },
        index: true,
    },
    payTabsTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PayTabsTransaction',
        required() {
            return this.paymentMethod === 'Paytabs';
        },
        index: true,
    },
}, { timestamps: true });

depositRequestSchema.pre('save', function run(next) {
    if (this.isNew) {
        const stringId = this._id.toString().slice(-5);
        const id = parseInt(stringId, 16) % 1e6;
        this.esId = id;
    }
    return next();
});

const DepositRequest = mongoose.model('DepositRequest', depositRequestSchema);

export default DepositRequest;

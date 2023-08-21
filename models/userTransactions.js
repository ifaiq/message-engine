import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            'Boost',
            'DeliveryFees',
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
        ],
        index: true,
    },
    userType: {
        type: String,
        enum: ['buyer', 'seller'],
        required() {
            return (this.type === 'Penalty');
        },
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Completed', 'Cancelled'],
        index: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required() {
            return (this.type === 'Purchase' || this.type === 'Revenue'
                    || this.type === 'Fees' || this.type === 'Rejection'
                    || this.type === 'DeliveryFees');
        },
    },
    depositRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DepositRequest',
        required() {
            return this.type === 'Deposit';
        },
    },
    withdrawalRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WithdrawalRequest',
        required() {
            return this.type === 'Withdrawal';
        },
    },
    returnRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnRequest',
        required() {
            return this.type === 'Return';
        },
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required() {
            return this.type === 'Promotion' || this.type === 'Premium'
                    || this.type === 'Post Gift';
        },
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required() {
            return this.type === 'StorageFees';
        },
    },
    value: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const userTransactionsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    credit: {
        type: Number,
        default: 0,
        required: true,
    },
    debit: {
        type: Number,
        default: 0,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
        required: true,
    },
    pending: {
        type: Number,
        default: 0,
        required: true,
    },
    onHold: {
        type: Number,
        default: 0,
        required: true,
    },
    list: [transactionSchema],
});

const UserTransactions = mongoose.model('UserTransactions', userTransactionsSchema);

export default UserTransactions;

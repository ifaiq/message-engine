import mongoose from 'mongoose';

const voucherAnalyticsSchema = new mongoose.Schema({
    voucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const VoucherAnalytics = mongoose.model('VoucherAnalytics', voucherAnalyticsSchema);

export default VoucherAnalytics;

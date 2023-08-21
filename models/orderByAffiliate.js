import mongoose from 'mongoose';

const orderByAffiliateSchema = new mongoose.Schema({
    affiliateId: {
        type: String,
        required: true,
        index: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true,
    },
}, { timestamps: true });

const OrderByAffiliate = mongoose.model('orderByAffiliate', orderByAffiliateSchema);

export default OrderByAffiliate;

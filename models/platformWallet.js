import mongoose from 'mongoose';

const platformWalletSchema = new mongoose.Schema({
    amount: {
        type: Number,
        default: 0,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    transactions: [{
        value: {
            type: Number,
            min: 0,
        },
        type: {
            type: String,
            enum: [
                'Commission',
                'VAT',
                'Promotion',
                'Premium',
                'DeliveryFees',
            ],
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    }],
}, { timestamps: true });

const PlatformWallet = mongoose.model('PlatformWallet', platformWalletSchema);

export default PlatformWallet;

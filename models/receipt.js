import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            index: true,
        },
        receiptType: {
            type: String,
            enum: ['dropOff', 'pickUp', 'return'],
        },
        totalAmount: {
            type: Number,
            min: 0,
            required: true,
        },
    },
    { timestamps: true },
);

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;

import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
    {
        // time of the bid is the same as "createdAt" date from timestamp
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        pricePerItem: {
            type: Number,
            required: true,
            min: 1,
        },
        requiredQuantity: {
            type: Number,
            required: true,
            min: 1,
        },
        fulfilledQuantity: {
            type: Number,
            min: 0,
        },
        type: {
            type: String,
            enum: ['Manual Bid', 'Auto Bid', 'Buy Now'],
            required: true,
        },
    },
    { timestamps: true },
);

/*
instances of bids are created internally,
so no ajv validation needed for bid schema
*/

export default bidSchema;

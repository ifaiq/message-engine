import mongoose from 'mongoose';

const autoBidSchema = new mongoose.Schema({
    // time of auto bid submission is the same as "createdAt" date from timestamp
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    maxAmount: {
        type: Number,
        required: true,
    },
    requiredQuantity: {
        type: Number,
        min: 1,
        required: true,
    },
}, { timestamps: true });

// instances of autobid are created internally, so no ajv validation needed for autoBid schema

export default autoBidSchema;

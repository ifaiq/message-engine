import mongoose from 'mongoose';

const penaltySchema = new mongoose.Schema(
    {
        value: {
            type: Number,
            required: true,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
    },
    { timestamps: true },
);

const Penalty = mongoose.model('penalty', penaltySchema);

export default Penalty;

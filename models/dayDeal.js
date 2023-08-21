import mongoose from 'mongoose';

const dayDealSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        index: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Created', 'Started', 'CancelledForError', 'Completed'],
        required: true,
    },
    expiryDate: {
        type: Date,
    },
});

const DayDeal = mongoose.model('DayDeal', dayDealSchema);

export default DayDeal;

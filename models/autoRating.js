import mongoose from 'mongoose';

const autoRatingSchema = new mongoose.Schema({
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    revieweeType: {
        type: String,
        enum: ['seller', 'buyer'],
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true,
    },
    dropOffTimeRating: {
        type: Number,
        min: 1,
        max: 5,
        required: function isdropOffTimeRatingRequired() {
            return this.revieweeType === 'seller';
        },
    },
    pickUpTimeRating: {
        type: Number,
        min: 1,
        max: 5,
        required: function isPickUpTimeRatingRequired() {
            return this.revieweeType === 'buyer';
        },
    },
}, { timestamps: true });

const AutoRating = mongoose.model('AutoRating', autoRatingSchema);

// TODO Taimir Not used
export default AutoRating;

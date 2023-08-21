import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    // the time at which the review was created is the same as "createdAt" date from timestamp
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
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
    text: {
        type: String,
    },
    userRating: {
        average: {
            type: Number,
            min: 1,
            max: 5,
        },
        communication: {
            type: Number,
            min: 1,
            max: 5,
        },
        accurateDescription: {
            type: Number,
            min: 1,
            max: 5,
        },
        speedAndComfort: {
            type: Number,
            min: 1,
            max: 5,
        },
        trust: {
            type: Number,
            min: 1,
            max: 5,
        },
        overallExperience: {
            type: Number,
            min: 1,
            max: 5,
        },
    },
    adminReview: {
        isReviewed: {
            type: Boolean,
            default: false,
        },
        isAccepted: {
            type: Boolean,
            default: false,
        },
    },
}, { timestamps: true });

reviewSchema.pre('save', function run(next) {
    if (this.isModified('userRating')) {
        const ratingKeys = Object.keys(this.userRating);
        let sum = 0;
        let count = 0;
        ratingKeys.forEach((key) => {
            if (this.userRating[key] && this.userRating[key] !== 'average') {
                sum += this.userRating[key];
                count += 1;
            }
        });
        this.userRating.average = count !== 0 ? (sum / count) : 0;
    }
    return next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;

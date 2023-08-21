/**
 * User Verification Review model
 * @module UserVerificationReview
 */

import mongoose from 'mongoose';

const userVerificationReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        unique: true,
    },
    images: [{
        type: String,
        required: true,
    }],

    status: {
        type: String,
        enum: ['NEW', 'PENDING_REVIEW', 'REJECTED', 'VERIFIED'],
        default: 'NEW',
        required: true,
    },
    rejectionReason: {
        type: String,
        required: function rejectedStatus() {
            return this.status === 'REJECTED';
        },
    },
    numberOfActions: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

userVerificationReviewSchema.pre('save', function run(next) {
    if (this.status !== 'REJECTED') {
        this.rejectionReason = undefined;
    }
    return next();
});
// a new model to save cancelled and closed checkouts
const archivedUserVerificationReview = mongoose.model('ArchivedUserVerificationReview', userVerificationReviewSchema);

userVerificationReviewSchema.post('save', async function next() {
    if (this.status === 'VERIFIED') {
        await archivedUserVerificationReview.bulkWrite([{ insertOne: { document: this } }]);
        this.remove();
    }
});

const UserVerificationReview = mongoose.model('UserVerificationReview', userVerificationReviewSchema);

export default UserVerificationReview;

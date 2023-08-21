import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    returnRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnRequest',
        required: true,
        index: true,
    },
    user: {
        type: String,
        enum: ['seller', 'buyer'],
        required: true,
    },
    comment: {
        type: String,
        minlength: 1,
        maxlength: 500,
        required: true,
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

const CommentReview = mongoose.model('CommentReview', commentSchema);

export default CommentReview;

import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    // questionDate is the same as "createdAt" date from timestamp
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'postType',
        required: true,
        index: true,
    },
    postType: {
        type: String,
        enum: ['Post', 'PromotionalPost'],
        default: 'Post',
    },
    question: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 500,
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

const QuestionReview = mongoose.model('QuestionReview', questionSchema);

export default QuestionReview;

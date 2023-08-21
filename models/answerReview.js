import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    // answerDate is the same as "createdAt" date from timestamp
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    answer: {
        type: String,
        minlength: 1,
        maxlength: 500,
        required: function isAnswerRequired() {
            return this.images === undefined || this.images.length < 1;
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
    images: [{
        type: String,
        minlength: 5,
        maxlength: 2048,
        required: function isImagesRequired() {
            return this.answer === undefined;
        },
    }],
}, { timestamps: true });

const AnswerReview = mongoose.model('AnswerReview', answerSchema);

export default AnswerReview;

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
    },
    question: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 500,
    },
    answer: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        answer: {
            type: String,
            minlength: 1,
            maxlength: 500,
            required: function isAnswerRequired() {
                return this.images === undefined || this.images.length < 1;
            },
        },
        answerDate: {
            type: Date,
            required: true,
        },
        images: [{
            type: String,
            minlength: 5,
            maxlength: 2048,
            required: function isImagesRequired() {
                return this.answer === undefined;
            },
        }],
    }],
    isReadBySeller: {
        type: Boolean,
        default: false,
    },
    isReadByOwner: {
        type: Boolean,
        default: false,
    },
    answeredByAdmin: {
        type: Boolean,
        default: false,
    },
    requestToSwitchSecured: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true,
});

const Question = mongoose.model('Question', questionSchema);

export default Question;

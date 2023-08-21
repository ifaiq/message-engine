/**
 * Feedback model
 * @module feedback
 * @description Feedback of the user about the App details
 */
import mongoose from 'mongoose';

const typeVlaues = ['deactivateAccount', 'createPost', 'backofficeFeedback', 'checkoutSurvey'];
const feedbackSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        index: true,
        enum: typeVlaues,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    key: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        minlength: 1,
        maxlength: 1500,
        required: false,
    },
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
export { typeVlaues };

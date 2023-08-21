import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({

    question: {
        type: String,
        required: true,
        minlength: 2,
    },
    answer: {
        type: String,
        required: true,
        minlength: 1,
    },
    language: {
        type: String,
        required: true,
        enum: ['English', 'Arabic'],
    },

});

const FAQ = mongoose.model('FAQ', FAQSchema);

export default FAQ;

import mongoose from 'mongoose';

const termsAndConditionsSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true,
        minlength: 1,
    },
    category: {
        type: String,
        required: true,
        // TODO: Adding an enum to control the type of terms and conditions
    },
});

const TermsAndConditions = mongoose.model('TermsAndConditions', termsAndConditionsSchema);

export default TermsAndConditions;

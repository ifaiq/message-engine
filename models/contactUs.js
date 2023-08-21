import mongoose from 'mongoose';
import isValidPhoneNumber from './utils/isValidPhoneNumber.js';

const contactUsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50,
        index: true,
    },
    email: {
        type: String,
        minlength: 5,
        maxlength: 255,
        index: true,
    },
    phone: {
        number: {
            type: String,
            unique: true,
            validate: {
                validator: (v) => isValidPhoneNumber(v),
                message: (props) => `${props.value} is not a valid phone number.`,
            },
        },
    },
    country: {
        type: String,
        minlength: 5,
        maxlength: 50,
    },
    subject: {
        type: String,
        minlength: 5,
        maxlength: 50,
    },
    message: {
        type: String,
        minlength: 5,
        maxlength: 500,
    },
    response: {
        type: String,
        minlength: 5,
        maxlength: 500,
    },
}, { timestamps: true });

const ContactUs = mongoose.model('ContactUs', contactUsSchema);

export default ContactUs;

import mongoose from 'mongoose';
import isValidPhoneNumber from './utils/isValidPhoneNumber.js';

const otpSchema = new mongoose.Schema({
    otpCode: {
        type: String,
        minlength: 4,
        maxlength: 4,
        required: true,
    },
    invitee: {
        type: String,
        unique: true,
        required: [true, 'phone number is required.'],
        validate: {
            validator: (v) => isValidPhoneNumber(v),
            message: (props) => `${props.value} is not a valid phone number.`,
        },
    },
    createdBy: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    submittedSuccessfully: {
        type: Boolean,
        default: false,
        required: true,
    },
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;

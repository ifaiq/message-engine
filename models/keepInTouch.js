import mongoose from 'mongoose';
import isValidPhoneNumber from './utils/isValidPhoneNumber.js';

const keepInTouchSchema = new mongoose.Schema({
    email: {
        type: String,
        minlength: 5,
        maxlength: 255,
    },
    phone: {
        type: String,
        validate: {
            validator: (v) => isValidPhoneNumber(v),
            message: (props) => `${props.value} is not a valid phone number.`,
        },
    },
    username: {
        type: String,
        lowercase: true,
        validate: {
            validator: function isUsernameValid(v) {
                return /^(?=^.{3,30}$)(?!(.*[0-9\u0660-\u0669].*){6})^[a-z\u0621-\u064A]([._-]?[a-z\u0621-\u064A0-9\u0660-\u0669]+)*$/.test(v);
            },
            message: (props) => `${props.value} is not a valid username.`,
        },
    },
    registered: {
        type: Boolean,
        default: false,
        required: true,
    },
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en',
    },
    usernameReservationEndDate: {
        type: Date,
        default: '2021-08-01', // Default is created for documents already created
    },
}, { timestamps: true });

const KeepInTouch = mongoose.model('KeepInTouch', keepInTouchSchema);

export default KeepInTouch;

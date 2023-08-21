import mongoose from 'mongoose';
import isValidPhoneNumber from './utils/isValidPhoneNumber.js';

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        minLength: 256,
        maxLength: 256,
    },
    phone: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: (v) => isValidPhoneNumber(v),
            message: (props) => `${props.value} is not a valid phone number.`,
        },
    },
    expirationDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;

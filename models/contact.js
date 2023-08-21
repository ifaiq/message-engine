import mongoose from 'mongoose';
import isValidPhoneNumber from './utils/isValidPhoneNumber.js';

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: 1,
            maxlength: 50,
            required: true,
        },
        phone: {
            number: {
                type: String,
                unique: false,
                required: [true, 'phone number is required.'],
                validate: {
                    validator: (v) => isValidPhoneNumber(v),
                    message: (props) => `${props.value} is not a valid phone number.`,
                },
            },
        },
    },
);

export default contactSchema;

/**
 * Address model
 * @module Address
 */

import mongoose from 'mongoose';

import isValidPhoneNumber from './utils/isValidPhoneNumber.js';

const addressSchema = new mongoose.Schema({
    name: { // address name
        type: String,
        required: true,
    },
    phone: {
        number: {
            type: String,
            validate: {
                validator: (v) => isValidPhoneNumber(v),
                message: (props) => `${props.value} is not a valid phone number.`,
            },
            required: true,
        },
    },
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    building: {
        type: String,
        required: true,
    },
    apartment: {
        type: String,
        required: true,
    },
    landmark: { type: String },
    arabicAddress: { type: String },
    postalCode: { type: String },
    coordinates: {
        lat: { type: Number },
        lon: { type: Number },
    },
});

const Address = mongoose.model('Address', addressSchema);
export default Address;

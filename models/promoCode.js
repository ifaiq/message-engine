import mongoose from 'mongoose';

// TODO
const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        value: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
        },
        expiryDate: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            enum: ['created', 'active', 'expired', 'used', 'deactivated'],
            default: 'created',
        },
        minimumPrice: {
            type: Number,
        },
    },
    { timestamps: true },
);

//---------------------------------------------------------------------------------
const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;

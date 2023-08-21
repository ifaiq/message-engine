import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: true,
        },
        ar: {
            type: String,
            required: true,
        },
    },
    country: {
        name: {
            en: {
                type: String,
                required: true,
            },
            ar: {
                type: String,
                required: true,
            },
        },
        countryCode: {
            type: String,
            required: true,
        },
        countryCodeISO3: {
            type: String,
            required: true,
        },
    },
    areas: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Area',
    }],
}, { timestamps: true });

const City = mongoose.model('City', citySchema);

export default City;

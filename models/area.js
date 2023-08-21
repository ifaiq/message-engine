import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
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
    city: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'City',
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number], // [X, Y] X for lon, Y for lat
            required: true,
        },
    },
}, { timestamps: true });

areaSchema.index({ location: '2dsphere' });

const Area = mongoose.model('Area', areaSchema);

export default Area;

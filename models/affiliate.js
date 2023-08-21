import mongoose from 'mongoose';

const affiliateSchema = new mongoose.Schema({
    // affiliate id Get from link
    affiliateId: {
        type: String,
        required: true,
        index: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true,
    },
    deviceId: {
        type: String,
        index: true,
    },
    // target user who view post through affiliate link
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        index: true,
    },
    type: {
        type: String,
        enum: ['user', 'anonymous'],
    },
}, { timestamps: true });

const Affiliate = mongoose.model('affiliate', affiliateSchema);

export default Affiliate;

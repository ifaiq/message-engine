import mongoose from 'mongoose';

const statuses = ['NEW', 'REJECTED', 'DONE', 'CANCELLED'];
const offlineRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['valet', 'pickPackAndShip'],
        required: true,
    },
    status: {
        type: String,
        enum: statuses,
        default: 'NEW',
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    PPSAmount: {
        type: Number,
        required: function isPickPackAndShip() {
            return this.type === 'pickPackAndShip';
        },
    },
    valetFees: {
        type: Number,
        required: function isValet() {
            return this.type === 'valet';
        },
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: function isPickPackAndShip() {
            return this.type === 'pickPackAndShip';
        },
    },
}, { timestamps: true });

const OfflineRequest = mongoose.model('OfflineRequest', offlineRequestSchema);
export { statuses };
export default OfflineRequest;

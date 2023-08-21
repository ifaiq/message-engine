import mongoose from 'mongoose';
import firebaseLinkResolve from './utils/firebaseLink.js';

const bulkRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        fileName: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED'],
            required: true,
        },
        link: {
            type: String,
        },
    },
    { timestamps: true },
);

bulkRequestSchema.pre('save', function run(next) {
    if (this.status === 'COMPLETED') {
        this.link = firebaseLinkResolve(this.fileName);
    }
    return next();
});

const BulkRequest = mongoose.model('BulkRequest', bulkRequestSchema);

export default BulkRequest;

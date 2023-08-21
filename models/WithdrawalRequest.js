import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const withdrawalRequestSchema = new mongoose.Schema(
    {
        esId: {
            // This is an id that is specifically done to be indexed in elasticSearch
            type: Number,
            es_indexed: true,
            es_type: 'keyword',
        },
        user: {
            type: ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        SP: {
            type: ObjectId,
            ref: 'ServicePoint',
            required() {
                return this.paymentMethod === 'SP';
            },
        },
        timeslot: {
            type: Date,
            required() {
                return this.paymentMethod === 'SP';
            },
        },
        expiryDate: {
            type: Date,
        },
        amount: {
            type: Number,
            min: 1,
            required: true,
        },
        status: {
            type: String,
            enum: ['opened', 'canceled', 'completed'],
            default: 'opened',
        },
        paymentMethod: {
            type: String,
            default: 'SP',
            enum: ['SP', 'Paytabs'],
        },
        payTabsTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PayTabsTransaction',
            required() {
                return this.paymentMethod === 'Paytabs';
            },
            index: true,
        },
    },
    { timestamps: true },
);

withdrawalRequestSchema.pre('save', function run(next) {
    if (this.isNew) {
        const stringId = this._id.toString().slice(-5);
        const id = parseInt(stringId, 16) % 1e6;
        this.esId = id;
    }
    return next();
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

export default WithdrawalRequest;

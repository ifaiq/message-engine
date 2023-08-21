import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        SP: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'ServicePoint',
        },
        action: {
            type: String,
            enum: ['Order', 'ReturnRequest', 'WithdrawalRequest', 'DepositRequest', 'Post', 'Checkout'],
            required: true,
        },
        actionType: {
            type: String,
            enum: ['pickUp', 'dropOff'],
            required() {
                return (this.action === 'Order' || this.action === 'ReturnRequest' || this.action === 'Post');
            },
        },
        actionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'action',
            index: true,
        },
        timeslot: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['created', 'completed', 'cancelled', 'expired'],
            default: 'created',
        },
        esId: {
            type: Number,
            es_indexed: true,
            es_type: 'keyword',
            index: true,
        },
    },
);

appointmentSchema.pre('save', function run(next) {
    if (this.isNew) {
        const stringId = this._id.toString().slice(-5);
        const id = parseInt(stringId, 16) % 1e6;
        this.esId = id;
    }
    return next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

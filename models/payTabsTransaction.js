import mongoose from 'mongoose';

const payTabsTransactionSchema = new mongoose.Schema(
    {
        transactionReference: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['opened', 'pending', 'hold', 'canceled', 'completed'],
            default: 'opened',
        },
        amount: {
            type: Number,
            required: true,
        },
        responseMessage: String,
        responseCode: String,
        paymentInfo: {
            paymentMethod: String,
            cardType: String,
            cardScheme: String,
            paymentDescription: String,
            expiryMonth: Number,
            expiryYear: Number,
            issuerCountry: String,
            issuerName: String,
        },
        phone: String, // this is saved here as well since the user can pay each time with a different phone (in case of Fawry or ValU)
        name: String,
        transactionTime: Date,
    },
    { timestamps: true },
);

//---------------------------------------------------------------------------------
const PayTabsTransaction = mongoose.model('PayTabsTransaction', payTabsTransactionSchema);

export default PayTabsTransaction;

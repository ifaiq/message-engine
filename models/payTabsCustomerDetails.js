import mongoose from 'mongoose';

const payTabsCustomerDetailsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        name: String,
        email: String,
        phone: String, // The phone used to pay by Fawry or ValU, might be different than the user's phone
        street1: String,
        city: String,
        state: String,
        country: String,
        zip: String,
        ip: String,
    },
    { timestamps: true },
);

//---------------------------------------------------------------------------------
const PayTabsCustomerDetails = mongoose.model('PayTabsCustomerDetails', payTabsCustomerDetailsSchema);

export default PayTabsCustomerDetails;

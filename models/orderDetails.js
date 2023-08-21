import mongoose from 'mongoose';

const orderStatus = [
    'Cancelled',
    'Completed',
    'Pending Completion',
    'Pending Delivery',
    'Pending Dropoff',
    'Pending Pickup',
    'Pending Seller Payment',
    'Rejected',
    'Returned',
    'Seller Revealed Buyer',
    'Waiting for Delivery',
    'Waiting for Dropoff',
    'Waiting for Pickup',
    'Waiting for Seller Payment',
];
const headersEnum = [
    'Buyer\'s information revealed to you',
    'Commission paid by seller',
    'Commission paid by you',
    'Item dropped-off by seller',
    'Item dropped-off by you',
    'Item picked-up by buyer',
    'Item picked-up by you',
    'Item rejected by the buyer',
    'Item rejected by you',
    'Order cancelled',
    'Order completed',
    'Order delivered to buyer',
    'Order delivered to you',
    'Order placed',
    'Return request created',
    'Your information revealed to seller',
];

//-------------------------------------------------------------------------
const orderHistorySchema = new mongoose.Schema({
    title: {
        type: String,
        enum: headersEnum,
        required: true,
    },
    subtitle: {
        type: String,
    },
    date: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Complete', 'Warning', 'Error'],
        required: true,
    },
});

//-------------------------------------------------------------------------
const orderDetailsSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true,
    },
    cards: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        returnRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ReturnRequest',
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        buyerStatus: {
            type: String,
            required: true,
            enum: orderStatus,
        },
        sellerStatus: {
            type: String,
            required: true,
            enum: orderStatus,
        },
        price: {
            type: Number,
            required: true,
        },
        buyerHistory: [orderHistorySchema],
        sellerHistory: [orderHistorySchema],
    }],
});

const OrderDetails = mongoose.model('OrderDetails', orderDetailsSchema);

export default OrderDetails;

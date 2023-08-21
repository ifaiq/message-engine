import mongoose from 'mongoose';

const returnStatus = ['Pending Seller Decision', 'Waiting for Seller Decision', 'Pending Buyer Response', 'Waiting for Buyer Response', 'Pending DropOff', 'Waiting for DropOff',
    'Pending Pickup', 'Waiting for Pickup', 'Under Investigation', 'Closed', 'Cancelled'];
const headersEnum = ['Return request created', 'Seller responds', 'Buyer responds', 'You respond', 'Item(s) dropped-off by buyer', 'Item(s) dropped-off by you', 'Item(s) picked-up by seller',
    'Item(s) picked-up by buyer', 'Item(s) picked-up by you', 'Return request closed', 'Return request cancelled', 'Investigation'];
const subtitleEnum = ['Due On', 'Accepted On', 'Rejected On', 'You requested an investigation', 'Buyer requested an investigation', 'You cancelled the request', 'Buyer cancelled the request',
    'You did not show', 'Buyer did not show', 'Seller did not show', 'You did not respond', 'Buyer did not respond', 'Pending', 'Buyer\'s Fault', 'Seller\'s Fault', 'Your Fault', ''];
//-------------------------------------------------------------------------
const returnHistorySchema = new mongoose.Schema({
    title: {
        type: String,
        enum: headersEnum,
        required: true,
    },
    subtitle: {
        type: String,
        enum: subtitleEnum,
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
const returnDetailsSchema = new mongoose.Schema({
    returnRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnRequest',
        required: true,
        index: true,
    },
    buyerStatus: {
        type: String,
        required: true,
        enum: returnStatus,
    },
    sellerStatus: {
        type: String,
        required: true,
        enum: returnStatus,
    },
    price: {
        type: Number,
        required: true,
    },
    buyerHistory: [returnHistorySchema],
    sellerHistory: [returnHistorySchema],
});

const ReturnDetails = mongoose.model('ReturnDetails', returnDetailsSchema);

export default ReturnDetails;

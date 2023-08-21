/**
 * Checkout model
 * @module Checkout
 */

import mongoose from 'mongoose';

import Appointment from './appointment.js';
import Order from './order.js';

const checkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    checkoutType: {
        type: String,
        enum: ['BUYNOW', 'AUCTION'],
        required: true,
    },
    status: {
        type: String,
        enum: ['OPEN', 'COMPLETED', 'CANCELLED'],
        required: true,
        default: 'OPEN',
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required() {
            return this.checkoutType === 'AUCTION';
        },
        index: true,
    },
    buyerShippingMethod: {
        type: String,
        enum: ['DELIVERY', 'PICKUP'],
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'ONLINE'],
    },
    paid: {
        type: Boolean,
        default: false,
    },
    redeemedVouchers: {
        list: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voucher',
        }],
        type: {
            type: String,
            enum: ['percentage', 'value', 'unlimitedValue'],
        },
        percentage: {
            type: Number,
            min: 1,
            max: 100,
        },
        value: {
            type: Number,
        },
    },
    totalPrice: { // Σ(item.post.price)
        type: Number,
        min: 0,
        default: 0,
    },
    discountsValue: { // Σ(voucher)
        type: Number,
        default: 0,
    },
    soldPrice: { // Σ(item.post.price - item.post.discount.discount_amount)
        type: Number,
        min: 0,
        default: 0,
    },
    numberOfItems: {
        type: Number,
        required: true,
    },
    estimatedDate: {
        type: Date,
    },
    relatedOrders: [{ // set after the checkout is completed, and canceled in case of auction.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        index: true,
    }],
});

// a new model to save cancelled and closed checkouts
const ArchivedCheckout = mongoose.model('ArchivedCheckout', checkoutSchema);

checkoutSchema.post('save', async function next() {
    if (this.status !== 'OPEN') {
        const id = this._id;
        await ArchivedCheckout.bulkWrite([{ insertOne: { document: this } }]);
        this.remove();
        Appointment.deleteMany({ actionId: id });
        Order.updateMany({ checkout: id }, [{ $unset: ['checkout'] }]);
    }
});

const Checkout = mongoose.model('Checkout', checkoutSchema);

export { ArchivedCheckout };
export default Checkout;

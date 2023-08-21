/**
 * Shopping Cart model
 * @module ShoppingCart
 */

import mongoose from 'mongoose';

const shoppingCartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        index: {
            unique: true,
            sparse: true,
        },
    },
    anonymousUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnonymousUser',
        required: true,
        unique: true,
        index: {
            unique: true,
            sparse: true,
        },
    },
    items: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        quantity: {
            type: Number,
        },
        postShippingMethod: { // selected shipping method in the cart for the item
            type: String,
            enum: ['DELIVERY', 'PICKUP'],
        },
        estimatedDeliveryDate: {
            type: Date,
        },
    }],
}, { timestamps: true });

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);
export default ShoppingCart;

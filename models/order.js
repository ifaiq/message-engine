import mongoose from 'mongoose';
import mongoosastic from '@hossny94/mongoosastic';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import isEmpty from '../misc/isEmpty.js';
import getEsClient from '../startup/es.js';
import userCheckedOutByAffiliate from './utils/checkoutByAffiliate.js';
// TODO: validate that the timeslot is not a day in the past
const orderSchema = new mongoose.Schema({
    esId: {
        // This is an id that is specifically done to be indexed in elasticSearch
        type: Number,
        es_indexed: true,
        es_type: 'keyword',
    },
    sellerData: {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            es_indexed: true,
            es_type: 'object',
            index: true,
        },
        actionType: { type: String, enum: ['pickUp', 'dropOff'] },
        SP: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicePoint', es_indexed: true },
        timeslot: { type: Date, es_indexed: true },
        authorizedPerson: {
            authorized: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: {
                type: String,
                minlength: 5,
                maxlength: 50,
                required() {
                    return (this.sellerData
                        && !isEmpty(this.sellerData.authorizedPerson)
                        && !this.sellerData.authorizedPerson.authorized);
                },
            },
            nationalID: {
                type: String,
                validate: {
                    validator(v) {
                        return /^[0-9]{14}/.test(v);
                    },
                    message: '{VALUE} is not a valid national id!',
                },
                required() {
                    return (this.sellerData
                        && !isEmpty(this.sellerData.authorizedPerson)
                        && !this.sellerData.authorizedPerson.authorized);
                },
            },
            SP: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicePoint' },
            actionType: { type: String, enum: ['pickUp', 'dropOff'] },
            timeslot: { type: Date },
            required: false,
        },
    },
    buyerData: {
        buyingMethod: {
            type: String,
            enum: ['auctionWithMinPrice', 'auctionWithoutMinPrice', 'buyNow'],
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            es_indexed: true,
            es_type: 'object',
            index: true,
        },
        SP: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicePoint', es_indexed: true },
        actionType: { type: String, enum: ['pickUp', 'dropOff'] },
        timeslot: { type: Date, es_indexed: true },
        isInsured: { type: Boolean },
        authorizedPerson: {
            authorized: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: {
                type: String,
                minlength: 5,
                maxlength: 50,
                required() {
                    return (this.buyerData
                        && !isEmpty(this.buyerData.authorizedPerson)
                        && !this.buyerData.authorizedPerson.authorized);
                },
            },
            nationalID: {
                type: String,
                validate: {
                    validator(v) {
                        return /^[0-9]{14}/.test(v);
                    },
                    message: '{VALUE} is not a valid national id!',
                },
                required() {
                    return (this.buyerData
                        && !isEmpty(this.buyerData.authorizedPerson)
                        && !this.buyerData.authorizedPerson.authorized);
                },
            },
            SP: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicePoint' },
            timeslot: { type: Date },
            actionType: { type: String, enum: ['pickUp', 'dropOff'] },
            required: false,
        },
        secondHighestBidder: {
            isBuyer: {
                type: Boolean,
                default: false,
            },
            status: {
                type: String,
                enum: ['undefined', 'accepted', 'rejected', 'pending'],
                default: 'undefined',
            },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        es_indexed: true,
        es_type: 'object',
    }],
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required() {
            return (
                this.buyerData.buyingMethod === 'auctionWithMinPrice'
                || this.buyerData.buyingMethod === 'auctionWithoutMinPrice'
            );
        },
    },
    soldPrice: { type: Number, min: 0, required: true }, // Σ(item.post.price - item.post.discount.discount_amount)
    totalPrice: { type: Number, min: 0, required: true }, // Σ(item.post.price)
    priceAfterVouchers: { type: Number, min: 0 }, // Σ(item.post.price - item.post.discount.discount_amount) - Σ(voucher)
    platformInspection: {
        isAccepted: Boolean,
        notes: String,
    },
    status: {
        type: String,
        enum: ['Created', 'Cancelled', 'Completed'],
        default: 'Created',
        es_indexed: true,
        es_type: 'keyword',
    },
    checkOutTime: { type: Date, min: '2019-01-01', es_indexed: true },
    dropOffTime: { type: Date, min: '2019-01-01', es_indexed: true },
    // arrivalAtBuyerSP: { type: Date, min: '2019-01-01' },
    sellerPickUp: { type: Boolean, default: false, es_indexed: true },
    pickUpTime: { type: Date, min: '2019-01-01', es_indexed: true },
    sellerPickUpTime: { type: Date, es_indexed: true },
    label: String, // may need some logic
    amountUnlocked: { // added to validate whether the amount has been unlocked at the seller's wallet or not
        type: Boolean,
        default: false,
    },
    vouchers: {
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
    buyerShippingMethod: {
        type: String,
        enum: ['DELIVERY', 'PICKUP'],
        es_indexed: true,
        es_type: 'keyword',
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'ONLINE'],
    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    comments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderComments',
    },
    createdAt: {
        type: Date,
        es_indexed: true,
    },
    updatedAt: {
        type: Date,
        es_indexed: true,
    },
    cancellationReason: {
        type: String,
        enum: [
            'BuyerDidNotShow',
            'SellerDidNotDropOff',
            'SellerDidNotPayCommission',
            'BuyerCancelledOrder',
            'CancelledByAdmin',
            'FailedDelivery',
            'OnBehalfOfTheSeller',
            'OnBehalfOfTheBuyer',
        ],
    },
    dropOffPeriodEnd: { type: Date, es_indexed: true },
    buyerPickUpPeriodEnd: { type: Date, es_indexed: true },
    unlockWalletPeriodEnd: { type: Date },
    sellerPickUpPeriodEnd: { type: Date, es_indexed: true },
    itemClaimPeriodEnd: { type: Date },
    buyerReviewed: { type: Boolean, default: false },
    sellerReviewed: { type: Boolean, default: false },
    sellerPaymentPeriodEnd: { type: Date, es_indexed: true }, // Unsecured order cycle
    buyerContactPeriodEnd: { type: Date, es_indexed: true }, // Unsecured order cycle
    sellerPaymentTime: { type: Date, es_indexed: true }, // Unsecured order cycle
    deliveryTime: { type: Date }, /** Date/Time order is delivered on */
    checkout: { // for orders created from winning auctions.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checkout',
    },
    createdFromCheckout: { // In order to differentiate between old and new orders
        type: Boolean,
    },
    deliveryFees: {
        type: Number,
    },
    isDeliveryFeesExcluded: {
        type: Boolean,
    },
    isDone: {
        type: Boolean,
        default: false,
        es_indexed: true,
    },
    isPPS: {
        type: Boolean,
        default: false,
    },
});

orderSchema.virtual('reviews', {
    ref: 'Review', // The model to use
    localField: '_id', // Find reviews where `localField`
    foreignField: 'order', // is equal to `foreignField`
});

orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });

orderSchema.set('timestamps', true);

orderSchema.pre('save', function run(next) {
    this.wasNew = this.isNew;
    if (this.isNew) {
        const stringId = this._id.toString().slice(-5);
        const id = parseInt(stringId, 16) % 1e6;
        this.esId = id;
    }

    // Calculate the order's price in case there are applied vouchers, according to the vouchers' type (% or value).
    // If the vouchers' value is greater than the order's price, then the price after applying the vouchers is zero.
    if (this.soldPrice && this.vouchers && this.vouchers.type) {
        if (this.vouchers.type === 'percentage') {
            this.priceAfterVouchers = this.soldPrice - (this.soldPrice * (this.vouchers.percentage / 100));
        } else if ((this.soldPrice - this.vouchers.value) < 0) {
            this.priceAfterVouchers = 0;
        } else {
            this.priceAfterVouchers = this.soldPrice - this.vouchers.value;
        }
        this.priceAfterVouchers = Math.round((this.priceAfterVouchers + Number.EPSILON) * 100) / 100; // Round to 2 decimal places
    } else this.priceAfterVouchers = undefined;

    return next();
});

orderSchema.post('save', (doc, next) => {
    if (doc.wasNew) {
        // create order by affiliate
        userCheckedOutByAffiliate(doc.buyerData.buyer, doc._id, doc.items);
    }
    next();
});

//---------------------------------------------------------------------------------
// Adding the indexing to elasticsearch
//---------------------------------------------------------------------------------
let indexName = '';
if (process.env.NODE_ENV === 'production') {
    indexName = 'prod-orders';
} else if (process.env.NODE_ENV === 'development') {
    indexName = 'dev-orders';
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const esClient = getEsClient();
    orderSchema.plugin(mongoosastic, {
        esClient,
        index: indexName,
        populate: [{
            path: 'sellerData.seller',
            select: 'email.address username phone.number markStore',
        },
        {
            path: 'buyerData.buyer',
            select: 'email.address username phone.number',
        },
        {
            path: 'items',
            select: 'post status',
            populate: {
                path: 'post',
                select: 'title english.description arabic.description',
            },
        },
        ],
    });
}
/* This should only be uncommented when working locally with elasticsearch and kibana installed on the laptop */
// else {
//     userSchema.plugin(mongoosastic, {
//         populate: [],
//     })
// }
orderSchema.plugin(updateIfCurrentPlugin);

const Order = mongoose.model('Order', orderSchema);

export default Order;

import mongoose from 'mongoose';
import config from 'config';

const numberOfGifts = config.get('gifts.numberOfUserGifts');

const giftSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    giftNumber: {
        type: Number,
        min: [1, `There are only gifts from 1 to ${numberOfGifts}`],
        max: [numberOfGifts, `There are only gifts from 1 to ${numberOfGifts}`],
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['locked', 'unlocked', 'halfClaimed', 'claimed', 'expired', 'blocked'],
        default: 'locked',
    },
    expiryDate: {
        type: Date,
        required: function isActive() {
            return this.status === 'unlocked';
        },
    },
    personalVoucher: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Voucher',
        required: [function hasPersonalVoucher() {
            return this.giftNumber === 2 || this.giftNumber === 4 || this.giftNumber === 5 || this.giftNumber === 6;
        }, 'Voucher ID must be input in this gift'],
    },
    giftVoucher: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Voucher',
        required: [function hasGiftVoucher() {
            return this.giftNumber === 5;
        }, 'Voucher ID must be input in this gift'],
    },
    primaryClaimDate: {
        type: Date,
    },
    secondaryClaimDate: {
        type: Date,
    },
    order: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Order',
        required: [function wasClaimedOnOrder() {
            return this.status === 'claimed' && (this.giftNumber === 2 || this.giftNumber === 4 || this.giftNumber === 5);
        }, 'Order ID has to be included'],
        index: true,
    },
    post: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Post',
        index: true,
    },
    /**
     * number value showing number of uses of the gift voucher.
     */
    blockCounter: {
        type: Number,
        default: 0,
    },
    /**
     * number value showing the overall money value the user has accumulated.
     */
    accumulatedGiftValue: {
        type: Number,
        default: 0,
    },
});

const Gift = mongoose.model('Gift', giftSchema);

export default Gift;

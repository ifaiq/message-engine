import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

const bidSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pricePerItem: {
        type: Number,
        required: true,
        min: 1,
    },
    type: {
        type: String,
        enum: ['Manual Bid', 'Auto Bid'],
        required: true,
    },
},
{ timestamps: true });

const promotionalAuctionSchema = new mongoose.Schema({
    biddingHistory: [bidSchema],
    numberOfBids: {
        type: Number,
        default: 0,
    },
    lastBid: bidSchema,
    endDate: {
        type: Date,
    },
    startPrice: {
        type: Number,
        required: true,
        min: 1,
    },
    interval: {
        type: Number,
        min: 0,
    },
    bidIncrement: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    status: {
        type: String,
        set(status) {
            this._previousStatus = this.status;
            return status;
        },
        enum: ['Running', 'Ended', 'Waiting Start Date'],
        required: true,
        default: 'Waiting Start Date',
    },
    type: {
        type: String,
        enum: ['Invitation', 'Post'],
        required: true,
    },
    autoBid: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        maxAmount: {
            type: Number,
        },
    },
    endedAt: {
        type: Date,
        index: true,
    },
}, { timestamps: true });

promotionalAuctionSchema.pre('save', function run(next) {
    if (this.isModified('biddingHistory')) {
        if (this.biddingHistory.length === 1) {
            this.numberOfBids = this.biddingHistory.length;
        } else {
            this.numberOfBids += (this.biddingHistory.length - 1);
        }
        this.lastBid = this.biddingHistory[this.biddingHistory.length - 1];
    }
    if (this.isModified('status') && this.status === 'Ended' && this._previousStatus === 'Running') {
        this.endedAt = Date.now();
    }
    return next();
});

promotionalAuctionSchema.plugin(updateIfCurrentPlugin);

const PromotionalAuction = mongoose.model('PromotionalAuction', promotionalAuctionSchema);

export default PromotionalAuction;

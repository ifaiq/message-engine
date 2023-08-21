import config from 'config';
import moment from 'moment';
import mongoose from 'mongoose';
import {
    updateIfCurrentPlugin,
} from 'mongoose-update-if-current';

import autoBidSchema from './autoBid.js';
import bidSchema from './bid.js';

const sliceValue = config.get('biddingHistorySliceValue');

const auctionSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true,
    },
    biddingHistory: [bidSchema],
    lastBid: bidSchema,
    avgSumOfLastXBids: {
        type: Number,
        min: 0,
        default: 0,
    },
    biddingCount: {
        type: Number,
        min: 0,
        default: 0,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
        validate: {
            validator: function isEndDateValid(v) {
                return v ? v > this.startDate : undefined;
            },
        },
    },
    startPrice: {
        type: Number,
        min: 0,
        default: 0,
    },
    interval: {
        type: Number,
        min: 0,
    },
    // `increment` should not be used as a schema path name unless you have disabled versioning
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
        enum: [
            'Deleted',
            'Ended',
            'Running',
            'Waiting Post Review',
            'Waiting Start Date',
        ],
        required: true,
    },
    endTime: {
        type: String,
    },
    endedAt: {
        type: Date,
        index: true,
    },
    autoBid: autoBidSchema,
},
{
    timestamps: true,
});

auctionSchema.pre('save', function run(next) {
    if (this.isModified('status') && this.status === 'Ended' && this._previousStatus === 'Running') {
        this.endedAt = Date.now();
    }
    if (!this.isModified('biddingHistory')) return next();
    // In case the last bid is the last value in the bidding history, skip everything (Nothing was added). For createOrder function
    if (this.lastBid && this.lastBid.pricePerItem === this.biddingHistory[this.biddingHistory.length - 1].pricePerItem
        && this.lastBid.user.equals(this.biddingHistory[this.biddingHistory.length - 1].user)) return next();

    if (this.biddingHistory.length < sliceValue + 1) {
        this.biddingCount = this.biddingHistory.length;
        // Corner case if biddingCount is less than 10 and autobid is made
    } else if (this.biddingCount === sliceValue - 1) {
        this.biddingCount += (this.biddingHistory.length - sliceValue + 1);
    } else {
        this.biddingCount += (this.biddingHistory.length - sliceValue);
    }
    this.lastBid = this.biddingHistory[this.biddingHistory.length - 1];

    const maxBidsToCalculateAvgSum = config.get('post.maxBidsToCalculateAvgSum');
    const maxAvgSum = config.get('maxInt32');
    this.avgSumOfLastXBids = 0;
    if (this.biddingHistory.length >= maxBidsToCalculateAvgSum) {
        this.avgSumOfLastXBids = 0;
        for (let i = this.biddingHistory.length - 1, j = 0; i > 0 && j < maxBidsToCalculateAvgSum; i -= 1, j += 1) {
            this.avgSumOfLastXBids += moment(this.biddingHistory[i].updatedAt).diff(moment(this.biddingHistory[i - 1].updatedAt));
        }
    }

    if (this.avgSumOfLastXBids > maxAvgSum) {
        this.avgSumOfLastXBids = maxAvgSum;
    }
    if (this.isModified('status') && this.status === 'Deleted') {
        this.endDate = undefined;
    }
    return next();
});

auctionSchema.index({ status: 'text' });
auctionSchema.index({ endDate: -1 });
auctionSchema.index({ biddingCount: -1 });
auctionSchema.index({ avgSumOfLastXBids: 1 });
auctionSchema.plugin(updateIfCurrentPlugin);
const Auction = mongoose.model('Auction', auctionSchema);

export default Auction;

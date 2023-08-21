import mongoosastic from '@hossny94/mongoosastic';
import mongoose from 'mongoose';

import getEsClient from '../startup/es.js';

import getFakeViewsCount from './utils/fakeViewsCounter.js';

function validImages(v) {
    return v.length > 0;
}

const postReviewSchema = new mongoose.Schema({
    AIReview: [
        {
            imageName: {
                type: String,
            },
            result: {
                type: String,
                enum: ['pass', 'fail', 'notSure'],
            },
        },
    ],
    parentCategory: {
        type: String,
        minlength: 5,
        maxlength: 500,
        index: true,
    },
    category: {
        type: String,
        minlength: 5,
        maxlength: 500,
        index: true,
    },
    pendingCategory: {
        type: String,
        minlength: 5,
        maxlength: 500,
        index: true,
    },
    title: {
        type: String,
        minlength: 5,
        maxlength: 500,
    },
    images: {
        name: {
            type: [String],
        },
        reason: {
            type: String,
            minlength: 5,
            maxlength: 500,
        },
    },
    description: {
        type: String,
        minlength: 5,
        maxlength: 5000,
    },
    price: {
        type: String,
        minlength: 5,
        maxlength: 500,
    },
    auction: {
        startPrice: {
            type: String,
            minlength: 5,
            maxlength: 500,
        },
        bidIncrement: {
            type: String,
            minlength: 5,
            maxlength: 500,
        },
    },
    fields: [{
        name: {
            type: String,
            minLength: 3,
        },
        reason: {
            type: String,
            minlength: 5,
            maxlength: 500,
        },
    }],
    additionalFields: [String],
    otherReason: {
        type: String,
        minlength: 5,
        maxlength: 500,
    },
});

const postSchema = new mongoose.Schema(
    {
        esId: {
            // This is an id that is specifically done to be indexed in elasticSearch
            type: Number,
            es_indexed: true,
            es_type: 'keyword',
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            es_indexed: true,
            es_type: 'object',
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            es_indexed: true,
            es_type: 'object',
        },
        pendingCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PendingCategory',
            es_indexed: true,
            es_type: 'object',
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            es_indexed: true,
            es_type: 'object',
            index: true,
        },
        title: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 255,
            es_indexed: true,
        },
        images: {
            type: [String],
            validate: [validImages, 'Please add at least one image'],
        },
        thumbnail: {
            type: String,
            required: true,
            es_indexed: true,
        },
        sellingMethod: {
            type: String,
            enum: [
                'auctionWithMinPrice',
                'auctionWithMinPriceAndBuyNow',
                'auctionWithoutMinPrice',
                'auctionWithoutMinPriceAndBuyNow',
                'buyNow',
            ],
            required: true,
            es_indexed: true,
            es_type: 'keyword',
        },
        price: {
            // Price is required in case the SellingFormat is Buy Now or Both (Auction & Buy Now)
            type: Number,
            min: 1,
            required() {
                return (
                    this.sellingMethod === 'buyNow'
                    || this.sellingMethod === 'auctionWithMinPriceAndBuyNow'
                    || this.sellingMethod === 'auctionWithoutMinPriceAndBuyNow'
                );
            },
            es_indexed: true,
        },
        condition: {
            type: String,
            enum: [
                'Defective',
                'Mint',
                'New and sealed',
                'New with open box',
                'Used',
            ],
            required: true,
            es_indexed: true,
            es_type: 'keyword',
        },
        warranty: {
            exists: {
                type: Boolean,
                required: true,
                es_indexed: true,
            },
            expiryDate: {
                type: Date,
                required() {
                    return this.warranty.exists;
                },
                es_indexed: true,
            },
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            },
        ],
        language: {
            type: String,
            required: true,
            enum: [
                'Arabic',
                'Both',
                'English',
            ],
        },
        status: {
            type: String,
            set(status) {
                this._previousStatus = this.status;
                return status;
            },
            required: true,
            enum: [
                'available',
                'declined',
                'deleted',
                'pendingReview',
                'rejected',
                'sold',
                'standBy',
                'underReview',
                'waitingDescriptionChange',
                'waitingStartDate',
            ],
            es_indexed: true,
        },
        archivedFromAvailable: { type: Boolean },
        wholeEdit: {
            type: Boolean,
            default: false,
        },
        originalPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        reviewDetails: {
            type: postReviewSchema,
            required: false,
            es_indexed: false,
        },
        declineReason: {
            type: postReviewSchema,
            required: false,
            es_indexed: false,
        },
        reviewCounter: {
            type: Number,
            min: 0,
            default: 0,
        },
        originalQuantity: {
            type: Number,
            required: true,
        },
        availableQuantity: {
            type: Number,
            required: true,
            default: function defaultAvailableQuantity() {
                return this.originalQuantity;
            },
            validate: [
                function validAvailableQuantity(v) {
                    return v <= this.originalQuantity;
                },
                'Must be less than or equals to the originalQuantity',
            ],
            es_indexed: true,
        },
        itemsAtSPQuantity: {
            type: Number,
            required: true,
            default: 0,
        },
        english: {
            description: {
                type: String,
                maxlength: 5000,
                es_indexed: true,
                es_type: 'text',
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
                es_indexed: true,
                es_type: 'object',
            },
        },
        arabic: {
            description: {
                type: String,
                maxlength: 5000,
                es_indexed: true,
                es_type: 'text',
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
                es_indexed: true,
                es_type: 'object',
            },
        },
        suggestedArabic: {
            description: {
                type: String,
                minlength: 5,
                maxlength: 5000,
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
            },
        },
        suggestedEnglish: {
            description: {
                type: String,
                minlength: 5,
                maxlength: 5000,
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
            },
        },
        featured: {
            type: Boolean,
            default: false,

        },
        promotionPlan: {
            type: String,
            enum: [
                'Gold',
                'NoPlan',
                'Silver',
            ],
            default: 'NoPlan',
            required: false,
            es_indexed: true,
        },
        location: {
            point_type: {
                type: String,
                enum: ['Point'], // 'location.type' must be 'Point'
                default: 'Point',
            },
            coordinates: {
                type: [Number], // X for lon, Y for lat
                es_type: 'geo_point',
            },
        },
        SP: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServicePoint',
        },
        discount: {
            discount_value: {
                type: 'Number',
                min: 0,
                es_indexed: true,
            },
            discount_unit: {
                type: 'String',
                enum: ['percentage', 'amount'],
                es_indexed: true,
            },
            valid_until: {
                type: Date,
                min: Date.now(),
                es_indexed: true,
            },
            created_by: {
                type: String,
                enum: ['admin', 'user'],
            },
            discount_amount: {
                type: 'Number',
                min: 0,
                es_indexed: true,
            },
            discount_percentage: {
                type: 'Number',
                min: 0,
                max: 100,
            },
        },
        commissionAndVAT: {
            commission: {
                type: Number,
                default: 0,
                min: 0,
                max: 1,
            },
            VAT: {
                type: Number,
                default: 0,
                min: 0,
                max: 1,
            },
        },
        views: [{
            date: {
                type: Date,
            },
            numberOfViews: {
                type: Number,
                default: 0,
            },
        }],
        totalViewsCounter: {
            type: Number,
            min: 0,
            default: 0,
        },
        quantityRatio: {
            type: Number,
            min: 0,
            max: 1,
            default: 1,
        },
        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auction',
            es_indexed: true,
            es_type: 'object',
        },
        interval: {
            type: Number,
            min: 0,
        },
        endTime: {
            type: String,
        },
        expiryDate: {
            type: Date,
            es_indexed: true,
        },
        createdAt: {
            type: Date,
            es_indexed: true,
        },
        updatedAt: {
            type: Date,
            es_indexed: true,
        },
        startedAt: {
            type: Date,
        },
        isNewPost: {
            type: Boolean,
            required: true,
            default() {
                if (this.isNew) {
                    return true;
                }
                return false;
            },
        },
        freePromotion: {
            flag: {
                type: Boolean,
            },
            setBy: {
                type: String,
                enum: ['admin', 'user', 'gifts'],
            },
        },
        repostCounter: {
            type: Number,
            default: 0,
        },
        isDayDeal: {
            type: Boolean,
            default: false,
            es_indexed: true,
        },
        autoRepostCounter: {
            type: Number,
            default: 0,
        },
        autoRepostMaxValue: {
            type: Number,
        },
        cloned: {
            type: Boolean,
            default: false,
            es_indexed: true,
        },
        replicatedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        needsAppendedDataReview: {
            type: Boolean,
            default: false,
            es_indexed: true,
        },
        sellerPostType: {
            type: String,
            enum: [
                'PPS', // Pick, Pack, & Ship
                'DropOff',
                'Unsecured',
            ],
            required: true,
            default: 'DropOff',
            es_indexed: true,
            es_type: 'keyword',
        },
        isPPS: {
            type: Boolean,
            default: false,
        },
        postArea: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Area',
        },
        buyerShippingMethod: {
            type: String,
            enum: [
                'Both',
                'Delivery',
                'Pickup',
            ],
            default: 'Pickup',
            required() { return (this.sellerPostType === 'DropOff'); },
        },
        premium: {
            type: Boolean,
            default: false,
            es_indexed: true,
        },
        auctionBlockers: [{
            type: {
                type: String,
                enum: [
                    'insurance',
                    'fees',
                    'coins',
                ],
                index: true,
            },
            value: {
                type: Number,
                default: 0,
            },
        }],
        bulk: { // Created by BulkUpload
            type: Boolean,
            default: false,
            es_indexed: true,
        },
        consentForDelivery: {
            type: Boolean,
            default: true,
        },
        olxPost: {
            type: Boolean,
            default: false,
        },
        olxCreationDate: {
            type: Date,
            default() {
                if (this.olxPost) return Date.now();
            },
        },
        olxId: {
            type: String,
            required() {
                return this.olxPost;
            },
        },
        currentPrice: {
            type: Number,
            min: 0,
            default: 0,
            es_indexed: true,
        },
    },
    { timestamps: true },
);
postSchema.pre('save', function run(next) {
    if (this.isModified('availableQuantity')) {
        this.quantityRatio = this.availableQuantity / this.originalQuantity;
    }
    if (this.isModified('discount')) {
        if (this.discount.discount_unit !== undefined && this.discount.discount_value !== undefined) {
            if (this.discount.discount_unit === 'percentage') {
                this.discount.discount_percentage = this.discount.discount_value;
                this.discount.discount_amount = (this.discount.discount_value / 100) * this.price;
            } else {
                this.discount.discount_percentage = (this.discount.discount_value / this.price) * 100;
                this.discount.discount_amount = this.discount.discount_value;
            }
        } else this.discount = undefined;
    }
    if (this.isNew) {
        const stringId = this._id.toString().slice(-5);
        const id = parseInt(stringId, 16) % 1e6;
        this.esId = id;
    }
    if (this.isModified('status') && this.status === 'available') {
        this.startedAt = Date.now();
    }
    if (this.isModified('status') && this.status === 'standBy') {
        this.endTime = undefined;
        this.expiryDate = undefined;
    }
    if (this.isModified('status') && this.status === 'deleted' && this._previousStatus === 'standBy') {
        this.endTime = undefined;
        this.expiryDate = undefined;
        this.archivedFromAvailable = true;
    }
    if (this.isModified('status') && this.status === 'sold') {
        this.endTime = undefined;
        this.expiryDate = undefined;
    }
    if (this.isModified('status') && this.status === 'available' && this._previousStatus === 'standBy') {
        if (this.repostCounter) {
            this.repostCounter += 1;
        } else {
            this.repostCounter = 1;
        }
    }
    /**
     * Set default starting value between 1 and 10 for totalViewsCounter
     */
    if (this.totalViewsCounter === 0) this.totalViewsCounter = getFakeViewsCount();
    return next();
});

postSchema.index({ 'discount.discount_percentage': -1 });
postSchema.index({ 'discount.valid_until': -1 });
postSchema.index({ quantityRatio: 1 });
postSchema.index({ totalViewsCounter: -1 });
postSchema.index({ '$**': 'text' }, { default_language: 'en', language_override: 'en' });
postSchema.index({ startedAt: -1 });
postSchema.index({ olxId: 1 }, { unique: true, partialFilterExpression: { olxPost: { $exists: true, $ne: false } } });

// 'default_language': 'en',
//  'language_override': 'en'

//---------------------------------------------------------------------------------
// Adding the indexing to elasticsearch
//---------------------------------------------------------------------------------
let indexName = '';
if (process.env.NODE_ENV === 'production') {
    indexName = 'prod-posts';
} else if (process.env.NODE_ENV === 'development') {
    indexName = 'dev-posts';
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const esClient = getEsClient();
    postSchema.plugin(mongoosastic, {
        esClient,
        index: indexName,
        populate: [{
            path: 'parentCategory',
            select: 'name',
        },
        {
            path: 'category',
            select: 'name prefix',
        },
        {
            path: 'pendingCategory',
            select: 'status',
        },
        {
            path: 'seller',
            select: 'userRating username',
        },
        {
            path: 'auction',
            select: 'lastBid.pricePerItem bidIncrement startPrice',
        },
        ],
    });
}
/* This should only be uncommented when working locally with elasticsearch and kibana installed on the laptop */
// else {
//     postSchema.plugin(mongoosastic, {
//         populate: [{
//             path: 'category',
//             select: 'name',
//         },
// {
//     path: 'seller',
//     select: 'ratingAsSeller',
// }],
//     })
// }

const Post = mongoose.model('Post', postSchema);

export default Post;

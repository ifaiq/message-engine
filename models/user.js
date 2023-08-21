import bcrypt from 'bcryptjs';
import mongoosastic from '@hossny94/mongoosastic';
import mongoose from 'mongoose';

import ShareableLink from './shareableLink.js';
import contactSchema from './contact.js';
import getEsClient from '../startup/es.js';
import createUserGifts from './utils/createUserGifts.js';
import createUserShareableLink from './utils/createUserShareableLink.js';
import createUserShoppingCart from './utils/createUserShoppingCart.js';
import isValidPhoneNumber from './utils/isValidPhoneNumber.js';
import returnEsId from './utils/returnEsId.js';
import Order from './order.js';

const userSchema = new mongoose.Schema({
    esId: {
        // This is an id that is specifically done to be indexed in elasticSearch
        type: Number,
        es_indexed: true,
        es_type: 'keyword',
    },
    name: {
        type: String,
        minlength: 5,
        maxlength: 100,
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        validate: {
            validator: function isUsernameValid(v) {
                return /^(?=^.{3,30}$)(?!(.*[0-9\u0660-\u0669].*){6})^[a-z\u0621-\u064A]([._-]?[a-z\u0621-\u064A0-9\u0660-\u0669]+)*$/.test(v);
            },
            message: (props) => `${props.value} is not a valid username.`,
        },
        es_indexed: true,
        index: true,
    },
    avatar: {
        type: String,
        minLength: 5,
        maxLength: 255,
    },
    email: {
        address: {
            type: String,
            minlength: 5,
            maxlength: 255,
            es_indexed: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        updatedAddress: {
            type: String,
            minlength: 5,
            maxlength: 255,
        },
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 1024,
        required: true,
    },
    phone: {
        number: {
            type: String,
            unique: true,
            validate: {
                validator: (v) => isValidPhoneNumber(v),
                message: (props) => `${props.value} is not a valid phone number.`,
            },
            required: [true, 'phone number is required.'],
            es_indexed: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        updatedNumber: {
            type: String,
            validate: {
                validator: (v) => isValidPhoneNumber(v),
                message: (props) => `${props.value} is not a valid phone number.`,
            },
        },
    },
    viewContact: {
        type: Boolean,
        default: false,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
    },
    dob: {
        type: Date,
    },
    accountCreatedBy: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
    },
    passwordChanged: { // On Verification If Created By Admin, password must be change as the one saved is a dummy one
        type: Boolean,
        default: false,
    },
    accountStatus: {
        type: String,
        default: 'activate',
        enum: ['activate', 'deactivate'],
    },
    isVerified: {
        type: Boolean,
        default: false,
        es_indexed: true,
    },
    nationalId: {
        type: String,
    },
    scannedNationalId: [{
        type: String,
        minlength: 5,
        maxlength: 2048,
    }],
    permanentAddress: {
        apartment: Number,
        floor: Number,
        building: Number,
        street: {
            type: String,
            minlength: 1,
            maxlength: 50,
        },
        district: {
            type: String,
            minlength: 1,
            maxlength: 50,
        },
        city: {
            type: String,
            minlength: 1,
            maxlength: 50,
        },
        country: {
            type: String,
            minlength: 1,
            maxlength: 50,
            default: 'Egypt',
        },
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    }],
    legalAddress: {
        address: {
            type: String,
            minlength: 1,
            maxlength: 500,
        },
    },
    feedback: {
        positiveCount: {
            type: Number,
            default: 0,
        },
        negativeCount: {
            type: Number,
            default: 0,
        },
    },
    userRating: {
        totalAverage: {
            type: Number,
            default: 0,
        },
        sellerAverage: {
            type: Number,
            default: 0,
        },
        buyerAverage: {
            type: Number,
            default: 0,
        },
        accurateDescription: {
            sum: {
                type: Number,
                default: 0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        speedAndComfort: {
            sum: {
                type: Number,
                default: 0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        trust: {
            sum: {
                type: Number,
                default: 0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        communication: {
            sum: {
                type: Number,
                default: 0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        overallExperience: {
            sum: {
                type: Number,
                default: 0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
    },
    auctions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
    }],
    specialAuctions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromotionalAuction',
    }],
    favoriteSP: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicePoint',
    },
    shoppingCart: [{ // TODO to be removed after closing checkout PRs
        quantity: {
            type: Number,
            min: 0,
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
            index: true,
        },
    }],
    watchList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        index: true,
    }],
    specialsWatchList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromotionalPost',
        index: true,
    }],
    role: {
        type: String,
        default: 'normalUser',
    },
    favoriteCategories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            index: true,
        },
    ],
    contactList: [contactSchema],
    banning: {
        isBanned: {
            type: Boolean,
            default: false,
            set(isBanned) {
                this._isBanned = this.banning?.isBanned || false;
                return isBanned;
            },
        },
        banPeriod: {
            type: Number,
            default: 0,
        },
        endDate: {
            type: Date,
        },
        banReason: {
            type: String,
        },
    },
    invitationAuction: {
        counter: {
            type: Number,
            default: 0,
        },
        isParticipating: {
            type: Boolean,
            default: false,
        },
        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PromotionalAuction',
        },
    },
    postAuction: {
        counter: {
            type: Number,
            default: 0,
        },
        isParticipating: {
            type: Boolean,
            default: false,
        },
        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PromotionalAuction',
        },
    },
    markStore: {
        type: Boolean,
        default: false,
        set(markStore) {
            this._markStore = this.markStore;
            return markStore;
        },
    },
    userTokens: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserTokens',
    },
    mobileToken: {
        platform: { type: String, enum: ['ios', 'android'] },
        token: { type: String },
    },
    soldItemsSinceStart: {
        type: Number,
        min: 0,
        default: 0,
    },
    createdAt: {
        type: Date,
        es_indexed: true,
    },
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en',
    },
    termsAndCondsAccepted: {
        type: Boolean,
        default: true,
        required: true,
    },
    exemptedFromCommission: {
        type: Boolean,
        default: false,
        required: true,
        es_indexed: true,
    },
    exemptedCommissionValue: {
        type: Number,
        default: 0,
    },
    personalData: {
        fullname: {
            type: String,
        },
        dob: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female'],
        },
    },
    rateApp: {
        type: String,
        default: 'rating',
        enum: ['no-rating', 'rating', 'rated'],
        required: true,
    },
    vouchers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voucher',
        },
    ],
    isEligibleToEarlyDropOff: {
        type: Boolean,
        default: false,
    },
    isAffiliate: { type: Boolean },
    prohibitedShippingMethods: [{
        type: String,
        enum: ['DELIVERY', 'PICKUP'],
    }],
    prohibitedPaymentMethods: [{
        type: String,
        enum: ['CASH', 'ONLINE'],
    }],
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
    },
    deviceDetails: {
        osVersion: { type: String },
        deviceModel: { type: String },
    },
    timezone: { type: String },
    accountDeletionDateTime: {
        type: Date,
    },
    prohibitedFromAuction: {
        type: Boolean,
        default: false,
    },
    downloadTime: {
        type: Date,
    },
    olxUser: {
        type: Boolean,
        default: false,
    },
    olxPostsSeeded: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

userSchema.pre('save', function run(next) {
    this.wasNew = this.isNew;
    if (this.isNew) this.esId = returnEsId(this._id);
    if (this.isModified('userRating')) {
        let buyerSum = 0;
        let buyerCount = 0;
        let sellerSum = 0;
        let sellerCount = 0;

        if (this.userRating.communication?.count > 0) {
            sellerSum += this.userRating.communication.sum;
            sellerCount += this.userRating.communication?.count;
        }
        if (this.userRating.accurateDescription?.count > 0) {
            sellerSum += this.userRating.accurateDescription.sum;
            sellerCount += this.userRating.accurateDescription?.count;
        }
        if (this.userRating.speedAndComfort?.count > 0) {
            sellerSum += this.userRating.speedAndComfort.sum;
            sellerCount += this.userRating.accurateDescription?.count;
        }
        if (this.userRating.trust?.count > 0) {
            sellerSum += this.userRating.trust.sum;
            sellerCount += this.userRating.trust?.count;
        }
        if (this.userRating.overallExperience?.count > 0) {
            buyerSum += this.userRating.overallExperience.sum;
            buyerCount += this.userRating.overallExperience?.count;
        }
        const totalSum = buyerSum + sellerSum;
        const totalCount = buyerCount + sellerCount;
        if (totalCount > 0) this.userRating.totalAverage = Number((totalSum / totalCount).toFixed(2));
        if (sellerCount > 0) this.userRating.sellerAverage = Number((sellerSum / sellerCount).toFixed(2));
        if (buyerCount > 0) this.userRating.buyerAverage = Number((buyerSum / buyerCount).toFixed(2));
    }
    if (this.isModified('banning.isBanned')) {
        this.prevIsBanned = this._isBanned;
    }
    if (this.isModified('markStore')) {
        this.prevMarkStore = this._markStore;
    }
    return next();
});

userSchema.post('save', async (doc, next) => {
    if (doc.wasNew) {
        createUserShareableLink(doc._id);
        createUserShoppingCart(doc._id);
        await createUserGifts(doc._id);
    }
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
        if (doc.prevIsBanned !== doc.banning?.isBanned) {
            ShareableLink.synchronize({ inviter: doc._id });
        }
        // resynchronize orders after changing seller's markStore value
        if (doc.prevMarkStore !== doc.markStore) {
            Order.synchronize({ 'sellerData.seller': doc._id });
        }
    }

    return next();
});

userSchema.methods.validPassword = async function verifyPassword(password) {
    const res = await bcrypt.compare(password, this.password);
    return res;
};

//---------------------------------------------------------------------------------
// Adding the indexing to elasticsearch
//---------------------------------------------------------------------------------
let indexName = '';
if (process.env.NODE_ENV === 'production') {
    indexName = 'prod-users';
} else if (process.env.NODE_ENV === 'development') {
    indexName = 'dev-users';
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const esClient = getEsClient();
    userSchema.plugin(mongoosastic, {
        esClient,
        index: indexName,
        populate: [
        ],
    });
}
/* This should only be uncommented when working locally with elasticsearch and kibana installed on the laptop */
// else {
//     userSchema.plugin(mongoosastic, {
//         populate: [],
//     })
// }

const User = mongoose.model('User', userSchema);

export default User;

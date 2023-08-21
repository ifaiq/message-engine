import mongoose from 'mongoose';
import mongoosastic from '@hossny94/mongoosastic';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import isEmpty from '../misc/isEmpty.js';
import getEsClient from '../startup/es.js';

const { ObjectId } = mongoose.Schema.Types;

const returnRequestSchema = new mongoose.Schema(
    {
        esId: {
            type: Number,
            es_indexed: true,
            es_type: 'keyword',
        },
        post: {
            type: ObjectId,
            ref: 'Post',
            required: true,
            es_indexed: true,
            es_type: 'object',
            index: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        order: {
            type: ObjectId,
            ref: 'Order',
            required: true,
            index: true,
        },
        items: [{ type: ObjectId, ref: 'Item', required: true }],
        reason: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 500,
        },
        description: {
            text: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 500,
            },
            adminReview: {
                isReviewed: {
                    type: Boolean,
                    default: false,
                    es_indexed: true,
                },
                isAccepted: {
                    type: Boolean,
                    es_indexed: true,
                },
            },
        },
        buyerData: {
            buyer: {
                type: ObjectId,
                ref: 'User',
                required: true,
                es_indexed: true,
                es_type: 'object',
            },
            SP: { type: ObjectId, ref: 'ServicePoint' },
            actionType: { type: String, enum: ['pickUp', 'dropOff'] },
            timeslot: { type: Date, es_indexed: true },
            isInsured: { type: Boolean, default: false },
            authorizedPerson: {
                authorized: { type: ObjectId, ref: 'User' },
                name: {
                    type: String,
                    minlength: 5,
                    maxlength: 255,
                    required() {
                        return (this.buyerData && this.buyerData.authorizedPerson
                            && !(isEmpty(this.buyerData.authorizedPerson)
                                || this.buyerData.authorizedPerson.authorized)
                        );
                    },
                },
                nationalID: {
                    type: String,
                    minlength: 14,
                    maxlength: 14,
                    required() {
                        return (this.buyerData && this.buyerData.authorizedPerson
                            && !(isEmpty(this.buyerData.authorizedPerson)
                                || this.buyerData.authorizedPerson.authorized)
                        );
                    },
                },
                SP: { type: ObjectId, ref: 'ServicePoint' },
                actionType: { type: String, enum: ['pickUp', 'dropOff'] },
                timeslot: { type: Date },
            },
        },
        sellerData: {
            seller: {
                type: ObjectId,
                ref: 'User',
                required: true,
                es_indexed: true,
                es_type: 'object',
            },
            SP: { type: ObjectId, ref: 'ServicePoint' },
            actionType: { type: String, enum: ['pickUp', 'dropOff'] },
            timeslot: { type: Date, es_indexed: true },
            authorizedPerson: {
                authorized: { type: ObjectId, ref: 'User' },
                name: {
                    type: String,
                    minlength: 5,
                    maxlength: 255,
                    required() {
                        return (this.sellerData && this.sellerData.authorizedPerson
                            && !(isEmpty(this.sellerData.authorizedPerson)
                                || this.sellerData.authorizedPerson.authorized)
                        );
                    },
                },
                nationalID: {
                    type: String,
                    minlength: 14,
                    maxlength: 14,
                    required() {
                        return (this.sellerData && this.sellerData.authorizedPerson
                            && !(isEmpty(this.sellerData.authorizedPerson)
                                || this.sellerData.authorizedPerson.authorized)
                        );
                    },
                },
                SP: { type: ObjectId, ref: 'ServicePoint' },
                actionType: { type: String, enum: ['pickUp', 'dropOff'] },
                timeslot: { type: Date },
            },
        },
        status: {
            type: String,
            enum: ['Opened', 'PendingSellerDecision', 'PendingBuyerResponse', 'PendingDropOff', 'UnderInvestigation', 'PendingPickUp', 'PendingPickUpAfterInvestigation', 'Closed', 'Cancelled'],
            default: 'Opened',
            es_indexed: true,
            es_type: 'keyword',
        },
        sellerDecision: {
            isAccepted: {
                type: Boolean,
            },
            sellerDecisionTime: {
                type: Date,
            },
            sellerDecisionNotes: {
                type: String,
                minLength: 1,
                maxLength: 500,
            },
            adminReview: {
                isReviewed: {
                    type: Boolean,
                    es_indexed: true,
                },
                isAccepted: {
                    type: Boolean,
                    es_indexed: true,
                },
            },
        },
        buyerResponse: {
            openInvestigation: {
                type: Boolean,
            },
            buyerResponseTime: {
                type: Date,
            },
            buyerResponseNotes: {
                type: String,
                minLength: 1,
                maxLength: 500,
            },
            adminReview: {
                isReviewed: {
                    type: Boolean,
                    es_indexed: true,
                },
                isAccepted: {
                    type: Boolean,
                    es_indexed: true,
                },
            },
        },
        investigation: {
            status: {
                type: String,
                enum: ['InProgress', 'Finished'],
                es_indexed: true,
                es_type: 'keyword',
            },
            outcome: {
                type: String,
                enum: ['Seller Fault', 'Buyer Fault'],
                es_indexed: true,
                es_type: 'keyword',
            },
            outcomeTime: {
                type: Date,
            },
            reason: {
                type: String,
                minlength: 5,
                maxlength: 500,
            },
            postEditIsNeeded: { type: Boolean },
        },
        sellerRejection: {
            isRejected: {
                type: Boolean,
            },
            sellerRejectionTime: {
                type: Date,
            },
            sellerRejectionNotes: {
                type: String,
                minLength: 1,
                maxLength: 500,
            },
        },
        comments: [{
            commentText: { type: String },
            commentTime: { type: Date },
            user: {
                type: String,
                enum: ['seller', 'buyer'],
            },
        }],
        dropOffTime: { type: Date, es_indexed: true },
        pickUpTime: { type: Date, es_indexed: true },
        sellerDecisionPeriodEnd: { type: Date, es_indexed: true },
        buyerResponsePeriodEnd: { type: Date, es_indexed: true },
        dropOffPeriodEnd: { type: Date, es_indexed: true },
        pickUpPeriodEnd: { type: Date, es_indexed: true },
        itemClaimPeriodEnd: { type: Date, es_indexed: true },
        createdAt: {
            type: Date,
            es_indexed: true,
        },
        updatedAt: {
            type: Date,
            es_indexed: true,
        },
        sellerPickUp: {
            type: Boolean,
            default: false,
        },
        buyerPickUp: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

returnRequestSchema.pre('save', function run(next) {
    if (this.isNew) {
        const stringId = this._id.toString().slice(-5);
        const id = parseInt(stringId, 16) % 1e6;
        this.esId = id;
    }
    return next();
});

//---------------------------------------------------------------------------------
// Adding the indexing to elasticsearch
//---------------------------------------------------------------------------------
let indexName = '';
if (process.env.NODE_ENV === 'production') {
    indexName = 'prod-return-requests';
} else if (process.env.NODE_ENV === 'development') {
    indexName = 'dev-return-requests';
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const esClient = getEsClient();
    returnRequestSchema.plugin(mongoosastic, {
        esClient,
        index: indexName,
        populate: [{
            path: 'sellerData.seller',
            select: 'email.address username phone.number',
        },
        {
            path: 'buyerData.buyer',
            select: 'email.address username phone.number',
        },
        {
            path: 'post',
            select: 'title english.description arabic.description',
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
returnRequestSchema.plugin(updateIfCurrentPlugin);

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);

export default ReturnRequest;

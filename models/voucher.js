import mongoose from 'mongoose';
import mongoosastic from '@hossny94/mongoosastic';
import getEsClient from '../startup/es.js';

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        es_indexed: true,
        es_type: 'keyword',
    },
    startDate: {
        type: Date,
        required: [function voucherValidityRangeRequired() {
            return (this.status === 'active');
        }, 'Voucher start date is required.'],
        es_indexed: true,
    },
    expiryDate: {
        type: Date,
        required: [function voucherValidityRangeRequired() {
            return (this.status === 'active');
        }, 'Voucher expiry date is required.'],
        es_indexed: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['value', 'percentage', 'unlimitedValue', 'wallet'],
        es_indexed: true,
        es_type: 'keyword',
    },
    value: {
        type: Number,
        required: [function hasAbsoluteValue() {
            return this.type === 'value' || this.type === 'unlimitedValue' || this.type === 'wallet';
        }, 'Value of voucher is required.'],
        es_indexed: true,
    },
    percentage: {
        type: Number,
        min: [1, 'Percentage value must be greater than 1'],
        max: [100, 'Percentage value cannot be greater than 100'],
        required: [function hasPercentageValue() {
            return this.type === 'percentage';
        }, 'Percentage value of voucher is required'],
        es_indexed: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['created', 'active', 'expired', 'used', 'deactivated'],
        default: 'created',
        es_indexed: true,
        es_type: 'keyword',
    },
    minimumPrice: {
        type: Number,
        required: [function hasAbsoluteValue() {
            return this.type === 'value';
        }, 'Vouchers with absolute value must have a minimum price'],
    },
    issuer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        es_indexed: true,
        es_type: 'object',
    },
    issuedFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function forPerson() {
            return (this.toBeUsedBy === 'Person' || this.toBeUsedBy === 'EverybodyButPerson');
        },
        es_indexed: true,
        es_type: 'object',
    },
    maxNumberOfUses: {
        type: Number,
        required: function forEverybody() {
            return this.toBeUsedBy === 'Generic';
        },
        es_indexed: true,
    },
    numberOfUses: {
        type: Number,
        default: 0,
        required: function forEverybody() {
            return this.toBeUsedBy === 'Generic';
        },
        es_indexed: true,
    },
    toBeUsedBy: {
        type: String,
        required: true,
        enum: ['Person', 'EverybodyButPerson', 'Generic'],
        default: 'Person',
    },
    target: [{
        type: {
            type: String,
            enum: ['Category', 'Age', 'Gender', 'Seller'],
        },
    }],
    createdAt: {
        type: Date,
        es_indexed: true,
    },
    updatedAt: {
        type: Date,
        es_indexed: true,
    },
}, { timestamps: true });

//---------------------------------------------------------------------------------
// Adding the indexing to elasticsearch
//---------------------------------------------------------------------------------
let indexName = '';
if (process.env.NODE_ENV === 'production') {
    indexName = 'prod-vouchers';
} else if (process.env.NODE_ENV === 'development') {
    indexName = 'dev-vouchers';
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const esClient = getEsClient();
    voucherSchema.plugin(mongoosastic, {
        esClient,
        index: indexName,
        populate: [{
            path: 'issuer',
            select: [
                'username',
                'phone.number',
            ],
        }, {
            path: 'issuedFor',
            select: [
                'username',
                'phone.number',
            ],
        },
        ],
    });
}
/* This should only be uncommented when working locally with elasticsearch and kibana installed on the laptop */
// else {
//     vouchers.plugin(mongoosastic, {
//         populate: [],
//     })
// }

//---------------------------------------------------------------------------------
const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;

import config from 'config';
import mongoose from 'mongoose';
import mongoosastic from '@hossny94/mongoosastic';
import getEsClient from '../startup/es.js';
import returnEsId from './utils/returnEsId.js';

const shareableLinkSchema = new mongoose.Schema(
    {
        esId: {
            // This is an id that is specifically done to be indexed in elasticSearch
            type: Number,
            es_indexed: true,
            es_type: 'keyword',
        },
        inviter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            es_indexed: true,
            es_type: 'object',
            index: true,
        },
        token: {
            type: String,
        },
        registrationCounter: {
            type: Number,
            default: 0,
            required: true,
            es_indexed: true,
        },
        status: {
            type: String,
            enum: ['active', 'used'],
            default: 'active',
            required: true,
            es_indexed: true,
            es_type: 'keyword',
        },
        maximumNumberOfRegistrations: {
            type: Number,
            default: config.get('invitation.maxNumberOfInvitations'),
            required: true,
            es_indexed: true,
        },
        extendFlag: {
            type: Boolean,
            default: false,
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
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    { timestamps: true },
);

//---------------------------------------------------------------------------------
// Adding the indexing to elasticsearch
//---------------------------------------------------------------------------------
let indexName = '';
if (process.env.NODE_ENV === 'production') {
    indexName = 'prod-shareable-links';
} else if (process.env.NODE_ENV === 'development') {
    indexName = 'dev-shareable-links';
}

shareableLinkSchema.pre('save', function run(next) {
    if (this.isNew) this.esId = returnEsId(this._id);
    return next();
});

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const esClient = getEsClient();
    shareableLinkSchema.plugin(mongoosastic, {
        esClient,
        index: indexName,
        populate: [{
            path: 'inviter',
            select: [
                'username',
                'email.address',
                'phone.number',
                'banning',
            ],
        },
        ],
    });
}
/* This should only be uncommented when working locally with elasticsearch and kibana installed on the laptop */
// else {
//     shareableLinkSchema.plugin(mongoosastic, {
//         populate: [],
//     })
// }

const ShareableLink = mongoose.model('ShareableLink', shareableLinkSchema);

export default ShareableLink;

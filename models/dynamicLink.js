import mongoose from 'mongoose';

const targetEnums = ['post', 'promotionalPost', 'action', 'seller', 'postSearch'];

function getModelValue(target) {
    let modelValue;
    switch (target) {
        case 'post':
            modelValue = 'Post';
            break;
        case 'promotionalPost':
            modelValue = 'PromotionalPost';
            break;
        case 'seller':
            modelValue = 'User';
            break;
        default:
            modelValue = undefined;
    }
    return modelValue;
}

const dynamicLinkSchema = new mongoose.Schema({
    target: {
        type: String,
        enum: targetEnums,
        required: true,
    },
    model: {
        type: String,
        default: function getModel() {
            return getModelValue(this.target);
        },
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'model',
        required: function isRequiredModel() {
            return !['action', 'postSearch'].includes(this.target);
        },
    },
    link: {
        type: String,
        index: true,
    },
    md5Hash: {
        type: String,
        required: function isMd5HashRequired() {
            return this.target === 'postSearch';
        },
    },
    affiliate: [
        {
            user: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'User',
            },
            link: {
                type: String,
            },
            date: {
                type: Date,
                default: new Date(),
            },
            affiliateId: {
                type: String,
            },
            version: {
                type: String,
                required: true,
            },
        },
    ],
    version: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const DynamicLink = mongoose.model('DynamicLink', dynamicLinkSchema);

export default DynamicLink;

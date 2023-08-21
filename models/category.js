import mongoose from 'mongoose';
import _ from 'lodash';

const categorySchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    parent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
    }],
    isParent: {
        type: Boolean,
        required: true,
    },
    name: {
        english: {
            type: String,
            required: true,
        },
        arabic: {
            type: String,
            required: true,
        },
    },
    fields: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        index: true,
    }],
    image: {
        type: String,
    },
    commission: {
        type: Number,
        min: 0,
        max: 100,
    },
    prefix: {
        english: {
            type: String,
        },
        arabic: {
            type: String,
        },
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    forceUnsecured: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const fieldSchema = new mongoose.Schema({
    name: {
        english: {
            type: String,
            required: true,
        },
        arabic: {
            type: String,
            required: true,
        },
    },
    type: {
        type: String,
        default: 'other',
        enum: ['noun', 'name', 'other'],
        required: true,
    },
    options: [{
        english: {
            type: String,
            required: true,
        },
        arabic: {
            type: String,
            required: true,
        },
    }],
});

fieldSchema.pre('save', function run(next) {
    const found = _.filter(this.options, (element) => element.english === 'Not Supported' && element.arabic === 'غير مدعوم');
    if (found.length === 0) this.options.unshift({ english: 'Not Supported', arabic: 'غير مدعوم' });
    return next();
});

const Category = mongoose.model('Category', categorySchema);
const Field = mongoose.model('Field', fieldSchema);

export {
    Category,
    Field,
};

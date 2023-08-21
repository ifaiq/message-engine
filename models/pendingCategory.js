import mongoose from 'mongoose';

const pendingCategorySchema = new mongoose.Schema({
    originalParent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
    },
    originalCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
    },
    parent: [{
        type: mongoose.Schema.Types.ObjectId,
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
        ref: 'PendingField',
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
    status: {
        type: String,
        enum: ['Approved', 'ApprovedWithModifications', 'Pending', 'Declined'],
        required: true,
        default: 'Pending',
    },
    declineReason: {
        type: String,
        minlength: 1,
        maxlength: 500,
    },
    updated: {
        parent: [{
            type: mongoose.Schema.Types.ObjectId,
        }],
        fields: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PendingField',
        }],
        name: {
            english: {
                type: String,
            },
            arabic: {
                type: String,
            },
        },
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
    },
}, { timestamps: true });

const pendingFieldSchema = new mongoose.Schema({
    originalField: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
    },
    originalPendingField: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PendingField',
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
    status: {
        type: String,
        enum: ['Approved', 'ApprovedWithModifications', 'Pending', 'Declined'],
        required: true,
        default: 'Pending',
    },
    updated: {
        name: {
            english: {
                type: String,
            },
            arabic: {
                type: String,
            },
        },
        type: {
            type: String,
            enum: ['noun', 'name', 'other'],
        },
        options: [{
            english: {
                type: String,
            },
            arabic: {
                type: String,
            },
        }],
    },
});

const PendingCategory = mongoose.model('PendingCategory', pendingCategorySchema);
const PendingField = mongoose.model('PendingField', pendingFieldSchema);

export {
    PendingCategory,
    PendingField,
};

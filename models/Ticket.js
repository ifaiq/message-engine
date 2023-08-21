import mongoose from 'mongoose';

const categories = ['Post', 'Payment', 'Delivery', 'Vendor', 'Purchase', 'Technical'];

const ticketSchema = new mongoose.Schema({

    category: {
        type: String,
        required: true,
        enum: categories,
    },

    submitter: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    subject: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
    },

    description: {
        type: String,
        minlength: 10,
        maxlength: 500,
        required: true,
    },

    replies: [{
        userReplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        adminReplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
        },
        text: {
            type: String,
            minlength: 1,
        },
        _id: false,
    }],

    isResolved: {
        type: Boolean,
        default: false,
    },

    status: {
        type: String,
        default: 'Created',
        enum: ['Created', 'Approved', 'InProgress', 'Resolved'],
    },

    issueDate: {
        type: Date,
        default: Date.now,
    },

    upDir: { type: String },

    images: {
        type: [String],
    },

    resolveDate: { type: Date },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

function getTicketCategories() {
    return categories;
}

export {
    Ticket,
    getTicketCategories as getCategories,
};

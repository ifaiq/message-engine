import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const orderCommentsSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true,
    },
    list: [commentSchema],
});

orderCommentsSchema.pre('save', function run(next) {
    const lastComment = this.list.pop();
    const sortedArray = [lastComment, ...this.list];
    this.list = sortedArray;
    return next();
});

const OrderComments = mongoose.model('OrderComments', orderCommentsSchema);

export default OrderComments;

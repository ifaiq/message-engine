import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    keywords: [{
        kw: {
            type: String,
            required: true,
            minlength: 1,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        deleted: {
            type: Boolean,
        },
    }],
}, { timestamps: true });
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;

import mongoose from 'mongoose';

const anonymousUserSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    viewedPosts: [
        {
            post: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post',
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    searchHistory: [{
        kw: {
            type: String,
            required: true,
            minlength: 1,
        },
        createdAt: {
            type: Date,
        },
        deleted: {
            type: Boolean,
        },
    }],
    favoriteCategories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            index: true,
        },
    ],
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en',
    },
    notificationToken: {
        platform: { type: String, enum: ['ios', 'android', 'web'] },
        token: { type: String },
    },
    userTokens: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserTokens',
    },
    topics: [{ type: String }],
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
    },
}, { timestamps: true });

const AnonymousUser = mongoose.model('AnonymousUser', anonymousUserSchema);

export default AnonymousUser;

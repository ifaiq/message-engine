import mongoose from 'mongoose';

const userViewedPostsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    posts: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
    }],
});
const UserViewedPosts = mongoose.model('userViewedPosts', userViewedPostsSchema);

export default UserViewedPosts;

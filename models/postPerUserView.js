/**
 * @description - This Model schema is saving views for a single post for each user.
 */

import mongoose from 'mongoose';

export const usersTypesEnum = [
    'User',
    'AnonymousUser',
];

const postPerUserViewSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post',
        index: true,
    },
    action: {
        type: String,
        enum: usersTypesEnum,
        required: true,
    },
    actionId: {
        type: String,
        required: true,
        refPath: 'action',
    },
},
{
    timestamps: true,
});

const PostPerUserView = mongoose.model('PostPerUserView', postPerUserViewSchema);

export default PostPerUserView;

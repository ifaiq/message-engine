/**
 * WatchList model
 * @module WatchList
 */

import mongoose from 'mongoose';

const watchListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required() { return (!this.anonymousUser); },
        index: {
            unique: true,
            sparse: true,
        },
    },
    anonymousUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnonymousUser',
        required() { return (!this.user); },
        index: {
            unique: true,
            sparse: true,
        },
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }],
}, { timestamps: true });

const WatchList = mongoose.model('WatchList', watchListSchema);
export default WatchList;

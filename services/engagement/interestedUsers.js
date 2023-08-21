/**
 * Interested Users Service
 * @module interestedUsers
 */

import winston from 'winston';

import isEmpty from '../../misc/isEmpty.js';
import isValidObjectId from '../../misc/isValidObjectId.js';

import User from '../../models/user.js';
import UserViewedPosts from '../../models/userViewedPosts.js';

//--------------------------------------------------------------
/**
 * @description    Gets interested users in input posts, for simplicity, returns the unique users who viewed those posts.
 *
 * @param          {Array.<mongoose.Types.ObjectId}    posts  -   The ids of the posts we want to get users interested in.
 *
 * @returns        {{error?: Error, results: Array.<{_id:mongoose.Types.ObjectId, language:String}>, numberOfResults: Number}}
 */
async function getInterestedUsers(posts) {
    if (isEmpty(posts) || posts.some((post) => !isValidObjectId(post))) {
        const error = new Error('Invalid or empty input for getInterestedUsers');
        winston.error(error);
        return ({ error, results: [], numberOfResults: 0 });
    }
    let users = await UserViewedPosts.find({
        posts: {
            $elemMatch: {
                $in: posts,
            },
        },
    }).populate({
        path: 'user',
        model: User,
        select: ['_id', 'language'],
    }).lean();
    users = users.map((e) => e.user);

    winston.debug(`Found ${users.length} users interested in posts, the users: ${users.map((user) => user._id)}`);

    return {
        results: users,
        numberOfResults: users.length,
    };
}

//--------------------------------------------------------------
export default getInterestedUsers;

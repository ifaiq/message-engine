/**
 * Similar Posts Service
 * @module similarPosts
 */

import config from 'config';
import mongoose from 'mongoose';
import winston from 'winston';

import isValidObjectId from '../../misc/isValidObjectId.js';

import Post from '../../models/post.js';

//--------------------------------------------------------------
/**
 * @description    Gets similar posts to the input postId using tf-idf, the input post is included,
 *                 thus only returns an empty array if there's an error.
 *
 * @param          {String}    postId  -   The id of the post we want to get similar posts to it.
 *
 * @returns        {{error?: Error, results: Array.<mongoose.Types.ObjectId>, numberOfResults: Number}}
 */
async function getSimilarPosts(postId) {
    if (!isValidObjectId(postId)) {
        const error = new Error(`Invalid Object Id <${postId}>`);
        winston.error(error);
        return ({ error, results: [], numberOfResults: 0 });
    }
    const size = config.get('engagement.maxNumberOfSimilarPosts');
    const queryObject = {
        size,
        query: {
            more_like_this: {
                like: [
                    {
                        _index: Post.indexName,
                        _id: postId.toString(),
                    },
                ],
                fields: [ // The combined tokens (words) of those fields are to be referred to as terms in the documentation below.
                    'title',
                    'english.description',
                    'arabic.description',
                    'english.data.*',
                    'arabic.data.*',
                    'category.name.*',
                ],
                max_query_terms: 500, // The maximum number of query terms that will be selected. Increasing this value gives greater accuracy at the expense of query execution speed. Defaults to 25.
                min_term_freq: 1, // The minimum term frequency (how many times does the term appear in the document) below which the terms will be ignored from the input document. Defaults to 2.
                max_doc_freq: 500, // The maximum document frequency (how many documents does the term appear in) above which the terms will be ignored from the input document. This could be useful in order to ignore highly frequent words such as stop words (relative to the collection). Defaults to unbounded (Integer.MAX_VALUE, which is 2^31-1 or 2147483647).
                include: true,
            },
        },
    };

    return new Promise(
        (resolve) => {
            Post.esSearch(
                queryObject,
                (error, body) => {
                    if (error) {
                        winston.error(error);
                        resolve({
                            error,
                            results: [],
                            numberOfResults: 0,
                        });
                    } else {
                        try {
                            // body -> { hits: { hits: [ { _id:String, _score:Number } ], total:Number } }
                            const { hits } = body;
                            const { total: numberOfResults } = hits;
                            let { hits: results } = hits;
                            results = results.map((hit) => mongoose.Types.ObjectId(hit._id));
                            winston.debug(`Found ${numberOfResults} posts similar to <${postId}>, the results: ${results}`);
                            resolve({
                                results,
                                numberOfResults,
                            });
                        } catch (err) {
                            winston.error(error);
                            resolve({
                                error,
                                results: [],
                                numberOfResults: 0,
                            });
                        }
                    }
                },
            );
        },
    );
}

//--------------------------------------------------------------
export default getSimilarPosts;

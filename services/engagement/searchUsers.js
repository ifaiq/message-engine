/**
 * Search Users Service
 * @module searchUsers
 */

import config from 'config';
import winston from 'winston';

import User from '../../models/user.js';

//--------------------------------------------------------------
function getBaseQuery() {
    const query = {
        bool: {
            filter: [],
        },
    };

    return query;
}

//--------------------------------------------------------------
function filterByEmail(email, queryObject) {
    const query = {
        match: {
            'email.address': {
                query: email,
                fuzziness: 'AUTO',
                operator: 'AND',
            },
        },
    };

    const outputQueryObject = queryObject;
    outputQueryObject.bool.filter.push(query);
    return outputQueryObject;
}

//--------------------------------------------------------------
function filterByPhone(phone, queryObject) {
    const query = {
        term: {
            'phone.number.keyword': {
                value: phone,
            },
        },
    };

    const outputQueryObject = queryObject;
    outputQueryObject.bool.filter.push(query);
    return outputQueryObject;
}

//--------------------------------------------------------------
function filterByVerified(isVerified, queryObject) {
    const query = {
        term: {
            isVerified: {
                value: isVerified,
            },
        },
    };

    const outputQueryObject = queryObject;
    outputQueryObject.bool.filter.push(query);
    return outputQueryObject;
}

//--------------------------------------------------------------
function filterByUsername(username, queryObject) {
    const query = {
        match: {
            username: {
                query: username,
                fuzziness: 'AUTO',
                analyzer: 'whitespace',
            },
        },
    };

    const outputQueryObject = queryObject;
    outputQueryObject.bool.filter.push(query);
    return outputQueryObject;
}

//--------------------------------------------------------------
function filterByExemptedUsers(queryObject) {
    const query = {
        term: {
            exemptedFromCommission: {
                value: true,
            },
        },
    };

    const outputQueryObject = queryObject;
    outputQueryObject.bool.filter.push(query);
    return outputQueryObject;
}

//--------------------------------------------------------------
/**
 * @description    Gets the users matching the search query.
 *
 * @param          {String}    [phone]  -   An exact phone number.
 * @param          {String}    [email]  -   A partial or full email.
 * @param          {'true' | 'false'}    [isVerified]  -   Whether to get the verified or unverified users, empty for all users.
 * @param          {String}    [username]  -   A partial username.
 * @param          {'true'}    [exempted]  -   Whether to get the exempted from commission users, empty for all users.
 *
 * @returns        {{error?: Error, results: Array.<{_id:mongoose.Types.ObjectId, language:String}>, numberOfResults: Number}}
 */
async function searchUsers(phone, email, isVerified, username, exempted) {
    let query = getBaseQuery();
    if (phone) {
        query = filterByPhone(phone, query);
    }
    if (email) {
        query = filterByEmail(email, query);
    }
    if (isVerified !== undefined) {
        query = filterByVerified(isVerified, query);
    }
    if (username) {
        query = filterByUsername(username.toLowerCase(), query);
    }
    if (exempted === 'true') {
        query = filterByExemptedUsers(query);
    }

    const size = config.get('engagement.maxNumberOfSearchUsers');

    return new Promise(
        (resolve) => {
            User.esSearch(
                {
                    size,
                    query,
                },
                {
                    hydrate: true,
                    hydrateOptions: {
                        select: ['_id', 'language'],
                    },
                },
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
                            // body -> { hits: { hits: [ { _id:String, language:String } ], total:Number } }
                            const { hits } = body;
                            const { total: numberOfResults, hits: results } = hits;
                            winston.debug(`Found ${numberOfResults} users with search query: ${phone ? `phone: ${phone} ` : ''}${email ? `email: ${email} ` : ''}${isVerified ? `isVerified: ${isVerified} ` : ''}${username ? `username: ${username} ` : ''}${exempted ? `exempted: ${exempted} ` : ''}`);
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
export default searchUsers;

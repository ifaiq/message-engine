/**
* Question Notifications
* @module
*/

import winston from 'winston';
import config from 'config';
import messages from '../i18n/i18n.js';
import equalObjectIds from '../misc/equalObjectIds.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import AnswerReview from '../models/answerReview.js';
import Post from '../models/post.js';
import PromotionalPost from '../models/promotionalPost.js';
import Question from '../models/question.js';
import QuestionReview from '../models/questionsReview.js';
import User from '../models/user.js';

const storageHost = config.get('storage_host');
const postThumbnailsContainerName = config.get('post.thumbnailsContainerName');
const promotionalPostThumbnailsContainerName = config.get('promotionalPost.thumbnailsContainerName');

async function notifyUserQuestionDisapproved(questionId) {
    try {
        const question = await QuestionReview.findById(questionId).select('user question').lean();
        if (isEmpty(question)) {
            const error = new Error(`Question with ID <${questionId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = question.user;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> for question with ID <${questionId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[user.language].qa.questionRejectedMailSubject,
                text: messages[user.language].qa.questionRejectedMailBody(user.username, question.question),
                language: user.language,
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyUserAnswerDisapproved(answerId) {
    try {
        const answer = await AnswerReview.findById(answerId).select('user answer').lean();
        if (isEmpty(answer)) {
            const error = new Error(`Answer with ID <${answerId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = answer.user;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID <${userId}> for answer with ID <${answerId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const notificationMeans = { isEmail: true };
        const params = {
            email: {
                subject: messages[user.language].qa.answerRejectedMailSubject,
                text: messages[user.language].qa.answerRejectedMailBody(user.username, answer.answer ? answer.answer : 'Image'),
                language: user.language,
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'MyPosts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyUserWithQuestionOnHisPost(askingUserId, postId, questionId) {
    try {
        const post = await Post.findById(postId).select('seller title thumbnail').lean();
        if (isEmpty(post) || !post.seller) {
            const error = new Error(`Post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const userId = post.seller;
        const user = await User.findById(userId).select('username language').lean();
        if (isEmpty(user)) {
            const error = new Error(`Seller with ID <${userId}> for post with ID <${postId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const payloadObj = {
            read: false,
            user: userId,
            post: postId,
            type: 'question',
            avatar: askingUserId,
            question: questionId,
            userType: 'seller',
        };

        const pushBody = messages[user.language].qa.receivedQuestionPushBody(post.title);
        const pushSubject = messages[user.language].qa.receivedQuestionPushSubject;

        const notificationMeans = { isEmail: true, isPush: true };
        const params = {
            email: {
                subject: messages[user.language].qa.receivedQuestionMailSubject,
                text: messages[user.language].qa.receivedQuestionMailBody(user.username, post.title),
                language: user.language,
            },
            push: {
                messages: [{
                    title: pushSubject,
                    body: pushBody,
                    image: `${storageHost}${postThumbnailsContainerName}/${post.thumbnail}`,
                }],
                payloads: [payloadObj],
            },
        };

        return await sendNotifications(notificationMeans, params, [userId], 'PostActions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

async function notifyQuestionFollowers(questionId, answerFromAdmin) {
    try {
        const question = await Question.findById(questionId).select('user answer postType post').lean();
        if (isEmpty(question)) {
            const error = new Error(`Question with ID <${questionId}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        const owner = await User.findById(question.user).select('username language').lean();
        if (isEmpty(owner)) {
            const error = new Error(`Question owner with ID <${question.user}> not found`);
            winston.error(error);
            return { sent: false, err: error };
        }

        let seller;
        let post;
        let storageLink;
        if (question.postType === 'Post') {
            post = await Post.findById(question.post).select('seller title thumbnail').lean();
            if (isEmpty(post)) {
                const error = new Error(`Post with ID <${question.post}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            storageLink = `${storageHost}${postThumbnailsContainerName}/`;

            seller = await User.findById(post.seller).select('username language').lean();
            if (isEmpty(seller)) {
                const error = new Error(`Post seller with ID <${post.seller}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
        } else {
            post = await PromotionalPost.findById(question.post).select('title thumbnail').lean();
            if (isEmpty(post)) {
                const error = new Error(`Promotional Post with ID <${question.post}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            storageLink = `${storageHost}${promotionalPostThumbnailsContainerName}/`;
        }

        if (!question.answer || question.answer.length < 1) {
            const error = new Error(`Question with ID <${questionId}> does not have any answer`);
            winston.error(error);
            return { sent: false, err: error };
        }
        const lastAnswer = question.answer[question.answer.length - 1];

        const usersNotToNotify = [];

        let answeringUsername;
        if (!answerFromAdmin) {
            usersNotToNotify.push(lastAnswer.user.toString());
            const answeringUser = await User.findById(lastAnswer.user).select('username').lean();
            if (isEmpty(answeringUser)) {
                const error = new Error(`Answering User with ID <${lastAnswer.user}> not found`);
                winston.error(error);
                return { sent: false, err: error };
            }
            answeringUsername = answeringUser.username;
        }

        // Notify seller if exists and not the one answering
        if (seller && lastAnswer.user && !equalObjectIds(seller._id, lastAnswer.user)) {
            const userId = seller._id.toString();
            usersNotToNotify.push(userId);

            const payloadObj = {
                read: false,
                user: userId,
                post: question.post,
                type: 'question',
                avatar: lastAnswer.user,
                question: questionId,
                userType: 'seller',
            };

            let postTitle;
            if (question.postType === 'Post') {
                postTitle = post.title;
            } else if (seller.language === 'en') {
                postTitle = post.title.english;
            } else {
                postTitle = post.title.arabic;
            }
            const pushBody = messages[seller.language].qa.notifySellerAnswerOnHisPostPushBody(answeringUsername, postTitle);
            const pushSubject = messages[seller.language].qa.notifySellerAnswerOnHisPostPushSubject;

            const notificationMeans = { isPush: true };
            const params = {
                push: {
                    messages: [{
                        title: pushSubject,
                        body: pushBody,
                        image: `${storageHost}${postThumbnailsContainerName}/${post.thumbnail}`,
                    }],
                    payloads: [payloadObj],
                },
            };

            const { sent, err } = await sendNotifications(notificationMeans, params, [userId], 'PostActions');
            if (!sent) return { sent, err };
        }

        // Notify question user if not the one answering
        if (answerFromAdmin || (lastAnswer.user && !equalObjectIds(owner._id, lastAnswer.user))) {
            const userId = owner._id.toString();
            usersNotToNotify.push(userId);

            const payloadObj = {
                read: false,
                user: userId,
                post: question.post,
                type: 'question',
                avatar: lastAnswer.user,
                question: questionId,
                userType: 'buyer',
            };
            let pushBody;
            let pushSubject;

            const firstSellerAnswer = seller && equalObjectIds(seller._id, lastAnswer.user) && question.answer.findIndex((answerElement) => equalObjectIds(answerElement.user, seller._id)) === question.answer.length - 1;

            let postTitle;
            if (question.postType === 'Post') {
                postTitle = post.title;
            } else if (owner.language === 'en') {
                postTitle = post.title.english;
            } else {
                postTitle = post.title.arabic;
            }

            if (firstSellerAnswer) {
                pushBody = messages[owner.language].qa.notifyQuestionOwnerFirstAnswerBySellerPushBody(postTitle);
                pushSubject = messages[owner.language].qa.notifyQuestionOwnerFirstAnswerBySellerPushSubject;
            } else {
                pushBody = messages[owner.language].qa.notifyBuyerAnswerOnQuestionPushBody(answeringUsername, postTitle, answerFromAdmin);
                pushSubject = messages[owner.language].qa.notifyBuyerAnswerOnQuestionPushSubject;
            }

            const notificationMeans = { isPush: true };
            const params = {
                push: {
                    messages: [{
                        title: pushSubject,
                        body: pushBody,
                    }],
                    payloads: [payloadObj],
                },
            };

            const { sent, err } = await sendNotifications(notificationMeans, params, [userId], 'PostActions');
            if (!sent) return { sent, err };
        }

        // Notify other users except the one answering

        const userIds = [];
        const pushMessages = [];
        const payloads = [];
        let buyersPushBody;
        let buyersPushSubject;
        for (let i = 0; i < question.answer.length; i += 1) {
            try {
                if (!question.answer[i].user || usersNotToNotify.findIndex((user) => equalObjectIds(user, question.answer[i].user)) !== -1) continue;

                usersNotToNotify.push(question.answer[i].user.toString());
                const userId = question.answer[i].user;
                const user = await User.findById(userId).select('username language').lean();
                if (isEmpty(user)) {
                    const error = new Error(`Question follwer with ID <${userId}> not found`);
                    winston.error(error);
                    continue;
                }

                userIds.push(userId);

                const payloadObj = {
                    read: false,
                    user: userId,
                    post: question.post,
                    type: 'question',
                    avatar: lastAnswer.user,
                    question: questionId,
                    userType: 'buyer',
                };

                payloads.push(payloadObj);

                let postTitle;
                if (question.postType === 'Post') {
                    postTitle = post.title;
                } else if (user.language === 'en') {
                    postTitle = post.title.english;
                } else {
                    postTitle = post.title.arabic;
                }

                buyersPushBody = messages[user.language].qa.notifyBuyerAnswerOnQuestionPushBody(answeringUsername, postTitle, answerFromAdmin);
                buyersPushSubject = messages[user.language].qa.notifyBuyerAnswerOnQuestionPushSubject;

                pushMessages.push({
                    title: buyersPushSubject,
                    body: buyersPushBody,
                    image: `${storageLink}${post.thumbnail}`,
                });
            } catch (error) {
                winston.error(`Something went wrong when creating the notify answer payload for user <${question.answer[i].user}>`);
            }
        }

        const notificationMeans = { isPush: true };
        const params = { push: { messages: pushMessages, payloads } };

        return await sendNotifications(notificationMeans, params, userIds, 'PostActions');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export {
    notifyUserQuestionDisapproved,
    notifyUserAnswerDisapproved,
    notifyUserWithQuestionOnHisPost,
    notifyQuestionFollowers,
};

/**
 * Top index.js module
 * @module
 */

//! DO NOT CHANGE THE ORDER OF IMPORT OF THESE 2 LINES -------------------------
import './startup/apm.js';
import apm from 'elastic-apm-node';
//! ----------------------------------------------------------------------------

import EventEmitter from 'events';
import express from 'express';
import { createServer } from 'http';
import { createRequire } from 'module'; // construct the require method
import winston from 'winston';
import { initDB } from './startup/db.js';
import loggingModule from './startup/logging.js';
import routeModule from './startup/routes.js';

import actionExecuter from './executor/action.js';
import adminExecutor from './executor/admin.js';
import appointmentExecutor from './executor/appointment.js';
import auctionExecutor from './executor/auction.js';
import chatExecuter from './executor/chat.js';
import checkoutExecutor from './executor/checkout.js';
import contactUsExecutor from './executor/contactUs.js';
import dayDealExecutor from './executor/dayDeal.js';
import emailVerificationExecutor from './executor/emailVerification.js';
import engagementExecutor from './executor/engagement.js';
import feedbackExecutor from './executor/feedback.js';
import generalExecutor from './executor/general.js';
import giftsExecutor from './executor/gifts.js';
import invitationExecutor from './executor/invitation.js';
import itemExecutor from './executor/item.js';
import multiSPExecutor from './executor/multiSP.js';
import notificationReminder from './executor/notificationReminder.js';
import offlinePostRequestExecuter from './executor/offlinePostRequest.js';
import orderExecutor from './executor/order.js';
import penaltyExecutor from './executor/penalty.js';
import postExecutor from './executor/post.js';
import promotionalAuctionExecutor from './executor/promotionalAuction.js';
import questionExecutor from './executor/question.js';
import reminderExecutor from './executor/reminder.js';
import returnRequestExecutor from './executor/returnRequest.js';
import reviewExecutor from './executor/review.js';
import shareableLinkExecutor from './executor/shareableLink.js';
import shoppingCartExecutor from './executor/shoppingCart.js';
import ticketExecutor from './executor/ticket.js';
import unsecuredOrderExecutor from './executor/unsecuredOrder.js';
import userExecutor from './executor/user.js';
import userTransactionsExecutor from './executor/userTransactions.js';
import voucherExecutor from './executor/voucher.js';
import walletExecutor from './executor/wallet.js';
import watchlistExecutor from './executor/watchlist.js';

EventEmitter.defaultMaxListeners = 100; // To suppress the memory leak warning that floods the log (we want more than 10 queues which is the default)
const jsonRequire = createRequire(import.meta.url);
const { version } = jsonRequire('./package.json');

const app = express();
const http = createServer(app);

loggingModule(apm);
initDB();
routeModule(app);

if (process.env.NODE_ENV !== 'test') {
    actionExecuter();
    adminExecutor();
    appointmentExecutor();
    auctionExecutor();
    chatExecuter();
    checkoutExecutor();
    contactUsExecutor();
    dayDealExecutor();
    emailVerificationExecutor();
    engagementExecutor();
    feedbackExecutor();
    generalExecutor();
    giftsExecutor();
    invitationExecutor();
    itemExecutor();
    multiSPExecutor();
    notificationReminder();
    offlinePostRequestExecuter();
    orderExecutor();
    penaltyExecutor();
    postExecutor();
    promotionalAuctionExecutor();
    questionExecutor();
    reminderExecutor();
    returnRequestExecutor();
    reviewExecutor();
    shareableLinkExecutor();
    shoppingCartExecutor();
    ticketExecutor();
    unsecuredOrderExecutor();
    userExecutor();
    userTransactionsExecutor();
    voucherExecutor();
    walletExecutor();
    watchlistExecutor();
}

const PORT = process.env.PORT || 3002;
const server = http.listen(PORT, () => {
    const startupMessage = `Server Version ${version} on ${process.env.NODE_ENV} Started @ ${(new Date()).toUTCString()} on Port ${PORT}.`;
    winston.info(startupMessage);
});

export default server;

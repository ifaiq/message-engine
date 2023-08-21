const queues = {
    general: {
        queueName: 'General',
        topic: {
            jobName: 'General-Topic',
        },
    },
    invitation: {
        mailInvitation: {
            queueName: 'Mail-Invitations',
            sendInvitationByMail: {
                jobName: 'Send-Invitation-By-Mail',
            },
        },
    },
    appointment: {
        schedule: {
            queueName: 'Schedule-Appointment',
        },
        comingSoon: {
            queueName: 'Appointment-Coming-Soon',
        },
    },
    shoppingCart: {
        queueName: 'Shopping-Cart-Posts',
        postRunningOutJobName: 'Shopping-Cart-Post-Running-Out',
        postDiscountedJobName: 'Shopping-Cart-Post-Discounted',
        postRepostedJobName: 'Shopping-Cart-Post-Reposted',
        postRunningOutJobNameAnonymous: 'Shopping-Cart-Post-Running-Out-for-AnonymousUser',
        postDiscountedJobNameAnonymous: 'Shopping-Cart-Post-Discounted-for-AnonymousUser',
        postRepostedJobNameAnonymous: 'Shopping-Cart-Post-Reposted-for-AnonymousUser',
    },
    watchlist: {
        queueName: 'Watchlist-Posts',
        postRunningOutJobName: 'Watchlist-Post-Running-Out',
        postDiscountedJobName: 'Watchlist-Post-Discounted',
        postRepostedJobName: 'Watchlist-Post-Reposted',
        postRunningOutJobNameAnonymous: 'Shopping-Cart-Post-Running-Out-for-AnonymousUser',
        postDiscountedJobNameAnonymous: 'Shopping-Cart-Post-Discounted-for-AnonymousUser',
        postRepostedJobNameAnonymous: 'Shopping-Cart-Post-Reposted-for-AnonymousUser',
    },
    emailVerification: {
        queueName: 'Fill-Profile-Data',
        jobName: 'Verify-Email',
        jobId: 5002,
        data: '',
        limit: 1000,
        // At 12:00 on day-of-month 1 and 15.
        cron: '0 12 1,15 * *',
    },
    post: {
        postExpired: {
            queueName: 'Post-Expired',
            withoutSelling: {
                jobName: 'Post-Expired-Without-Selling',
            },
            withQuantityRemaining: {
                jobName: 'Post-Expired-With-Quantity-Remaining',
            },
        },
        recommendPost: {
            queueName: 'Recommend-Post',
            recommendPostToPercentageOfUsers: {
                jobName: 'Recommend-To-Percentage-Of-Users',
            },
        },
        postAuction: {
            queueName: 'Post-Auction',
            firstBid: {
                jobName: 'Post-Auction-First-Bid',
            },
            premiumFeesPaid: {
                jobName: 'Premium-Post-Fees-Paid',
            },
        },
        postStatus: {
            queueName: 'Post-Status',
            postUnderReview: {
                jobName: 'Post-Under-Review',
            },
            postAccepted: {
                jobName: 'Post-Accepted',
            },
            postRejected: {
                jobName: 'Post-Rejected',
            },
            postDeclined: {
                jobName: 'Post-Declined',
            },
            postAcceptedAuction: {
                jobName: 'Post-Accepted-Auction',
            },
            postReposted: {
                jobName: 'Post-Reposted',
            },
            postDataAppended: {
                jobName: 'Post-Data-Appended',
            },
        },
        postTimers: {
            queueName: 'Post-Timers',
            expirePost: {
                jobName: 'Post-Expired-Timer',
            },
        },
        postActions: {
            queueName: 'Post-Actions',
            requestToSwitchSecured: {
                jobName: 'Request-To-Switch-Secured',
            },
        },
    },
    order: {
        queueName: 'Orders',
        orderCompleted: {
            jobName: 'Order-Completed',
        },
        sellerDidNotPickUp: {
            jobName: 'Order-Seller-No-Pick-Up',
            limit: 1,
        },
        sellerDidNotDropOff: {
            jobName: 'Order-Seller-No-Drop-Off',
        },
        buyerDidNotPickUp: {
            jobName: 'Order-Buyer-No-Pick-Up',
        },
        buyerRejectedItem: {
            jobName: 'Order-Buyer-Pick-Up-Reject-Item',
        },
        buyerPickedUpItem: {
            jobName: 'Order-Buyer-Pick-Up-Accept-Item',
        },
        sellerDroppedOffItemSeller: {
            jobName: 'Order-Seller-Drop-Off-Seller',
        },
        sellerDroppedOffItemBuyer: {
            jobName: 'Order-Seller-Drop-Off-Buyer',
        },
        chooseSP: {
            jobName: 'Choose-SP',
        },
        orderCancelledFromBuyer: {
            jobName: 'Order-Cancelled-From-Buyer',
        },
        orderCancelledAtInspection: {
            jobName: 'Order-Cancelled-At-Inspection',
        },
        orderCancelledByAdmin: {
            jobName: 'Order-Cancelled-By-Admin',
        },
        dropOffReceipt: {
            jobName: 'Order-Drop-Off-Receipt',
        },
        pickUpReceipt: {
            jobName: 'Order-Pick-Up-Receipt',
        },
        buyNowOrderCreated: {
            jobName: 'Buy-Now-Order-Created',
        },
        earlyDropOffOrderCreated: {
            jobName: 'Early-Drop-Off-Order-Created',
        },
        orderShipped: {
            jobName: 'Order-Shipped-Buyer',
        },
        orderDelivered: {
            jobName: 'Order-Delivered-Buyer',
        },
    },
    returnRequest: {
        noPickup: {
            queueName: 'Return-Request-No-Pickup',
            buyerNoShow: {
                jobName: 'Return-Request-Buyer-No-Pickup',
                limit: 1,
            },
            sellerNoShow: {
                jobName: 'Return-Request-Seller-No-Pickup',
                limit: 1,
            },
        },
        notifyNoShow: {
            queueName: 'Return-Request-Notify-No-Show',
            buyerDidNotPickup: {
                jobName: 'Buyer-No-Pickup-Job',
            },
            sellerDidNotPickup: {
                jobName: 'Seller-No-Pickup-Job',
            },
            buyerDidNotDropOff: {
                jobName: 'Buyer-No-Drop-Off-Job',
            },
        },
        notifyNoResponseOrRejection: {
            queueName: 'Return-Request-Notify-No-Response-Or-Rejection',
            buyerDidNotRespond: {
                jobName: 'Buyer-No-Response-Job',
            },
            sellerDidNotRespondOrRejected: {
                jobName: 'Seller-No-Response-Or-Rejection-Job',
            },
        },
        queueName: 'Return-Request-Queue',
        notifySellerToPickUp: {
            jobName: 'Return-Request-Notify-Seller-To-PickUp',
        },
        investigationOpened: {
            jobName: 'Return-Request-Investigation-Opened',
        },
        sellerAcceptsItems: { // seller accepts the items at the service point
            jobName: 'Return-Request-Seller-Accepts-Items',
        },
        buyersFault: {
            jobName: 'Return-Request-Buyers-Fault',
        },
        sellersFault: {
            jobName: 'Return-Request-Sellers-Fault',
        },
        sellerPicksUp: {
            jobName: 'Return-Request-Seller-PicksUp',
        },
        buyerPicksUp: {
            jobName: 'Return-Request-Buyer-PicksUp',
        },
        returnRequestCreated: {
            jobName: 'Return-Request-Created',
        },
        sellerAcceptsReturnRequest: { // seller's decision is to accept the return request
            jobName: 'Return-Request-Seller-Accepts-Return-Request',
        },
        investigationRequested: {
            jobName: 'Return-Request-Investigation-Requested',
        },
        buyerCancelled: {
            jobName: 'Return-Request-Buyer-Cancelled',
        },
        commentAccepted: {
            jobName: 'Return-Request-Comment-Accepted',
        },
        commentRejected: {
            jobName: 'Return-Request-Comment-Rejected',
        },
    },
    auction: {
        notifyAuctionWon: {
            queueName: 'Notify-Auction-Won',
            notifyWinner: {
                jobName: 'Notify-Winner',
            },
            notifySeller: {
                jobName: 'Notify-Seller',
            },
            notifyHighestBidderItemSold: {
                jobName: 'Notify-Highest-Bidder-Item-Sold',
            },
            notifyPreviousBidderOutbid: {
                jobName: 'Notify-Previous-Bidder-Outbid',
            },
            notifyBiddersAuctionAboutToEnd: {
                jobName: 'Notify-Bidders-Auction-About-To-End',
            },
        },
        notifyAuctionBidders: {
            queueName: 'Notify-Auction-Bidders',
            notifyBiddersPersonal: {
                jobName: 'Notify-Bidders-Personal',
            },
        },
    },
    user: {
        accountBanning: {
            queueName: 'User-Account-Banning',
            unbanningUser: {
                jobName: 'Unbanning-User-Account',
            },
            banningUser: {
                jobName: 'Banning-User-Account',
            },
        },
        userDetails: {
            queueName: 'User-Details',
            usernameUpdated: {
                jobName: 'User-Details-Username-Updated',
            },
            verificationEmail: {
                jobName: 'User-Details-Verification-Email',
            },
            resetPassword: {
                jobName: 'User-Details-Reset-Password',
            },
            accountDeletionRequest: {
                jobName: 'Account-Deletion-Request',
            },
            accountRestored: {
                jobName: 'Account-Restored',
            },
        },
        systemNotifications: {
            queueName: 'System-Notifications',
            email: {
                jobName: 'System-Notifications-Email',
            },
            sms: {
                jobName: 'System-Notifications-SMS',
            },
            push: {
                jobName: 'System-Notifications-Push',
            },
            percentage: {
                jobName: 'System-Notifications-Percentage',
            },
        },
    },
    promotionalAuction: {
        notifyPromotionalAuctionWon: {
            queueName: 'Notify-Promotional-Auction-Won',
            notifyWinner: {
                jobName: 'Notify-Winner',
            },
            notifyPreviousBidderOutbid: {
                jobName: 'Notify-Previous-Bidder-Outbid',
            },
            notifyBiddersPromotionalAuctionAboutToEnd: {
                jobName: 'Notify-Bidders-Promotional-Auction-About-To-End',
            },
        },
    },
    shareableLink: {
        queueName: 'Shareable-Link',
        linkRegenerated: {
            jobName: 'Shareable-Link-Regenerated',
        },
        linkExtended: {
            jobName: 'Shareable-Link-Extended',
        },
    },
    qa: {
        queueName: 'QA',
        question: {
            approved: {
                jobName: 'QA-Question-Approved',
            },
            disapproved: {
                jobName: 'QA-Question-Dispproved',
            },
            notifyFollowers: {
                jobName: 'QA-Notify-Followers',
            },
        },
        answer: {
            disapproved: {
                jobName: 'QA-Answer-Dispproved',
            },
        },
    },
    review: {
        queueName: 'Review',
        approved: {
            jobName: 'QA-Review-Approved',
        },
        disapproved: {
            jobName: 'QA-Review-Dispproved',
        },
    },
    admin: {
        queueName: 'Admin-Queue',
        adminPasswordReset: {
            jobName: 'Admin-Password-Reset',
        },
        adminReportProblem: {
            jobName: 'Admin-Report-Problem',
        },
    },
    contactUs: {
        queueName: 'Contact-Us-Queue',
        contactUsResponse: {
            jobName: 'Contact-Us-Response',
        },
    },
    ticket: {
        queueName: 'Ticket-Queue',
        ticketReply: {
            jobName: 'Ticket-Reply',
        },
    },
    voucher: {
        queueName: 'Vouchers-Queue',
        reissued: {
            jobName: 'Voucher-Reissued',
        },
        gift6SecondaryVoucher: {
            jobName: 'Voucher-Gift-6-Secondary',
        },
    },
    gifts: {
        queueName: 'Gifts-Queue',
        giftUnlocked: {
            jobName: 'Gift-Unlocked',
        },
        earnFreeGift: {
            jobName: 'Earn-A-Free-Gift',
            jobId: 5003,
            // At 12:00 on day-of-month 3 and 17.
            cron: '0 12 3,17 * *',
            data: '',
        },
        gift6Blocked: {
            jobName: 'Gift-6-Blocked',
        },
        giftExpiry: {
            jobName: 'Gift-Expiry',
        },
    },
    dayDeal: {
        queueName: 'Day-Deals',
        postStartingJobName: 'Day-Deal-Starting',
    },
    item: {
        queueName: 'Item-Queue',
        earlyDropOff: {
            jobName: 'Early-Drop-Off',
        },
        pickUpEarlyDroppedOff: {
            jobName: 'Pick-Up-Early-Dropped-Off',
        },
        earlyDropOffAppointmentCancelled: {
            jobName: 'Early-Drop-Off-Appointment-Cancelled',
        },
    },
    unsecuredOrder: {
        queueName: 'Unsecured-Order',
        orderCreated: {
            jobName: 'Unsecured-Order-Created',
        },
        orderCancelledByUser: {
            jobName: 'Unsecured-Order-Cancelled',
        },
        payCommissionReminder: {
            jobName: 'Pay-Commission-Reminder',
        },
        sellerDidnotPay: {
            jobName: 'Unsecured-Order-Seller-Didnot-Pay',
        },
        sellerPaid: {
            jobName: 'Unsecured-Order-Seller-Paid',
        },
        revealBuyerInfo: {
            jobName: 'Unsecured-Order-Reveal-Buyer-Info',
        },
        orderCompleted: {
            jobName: 'Unsecured-Order-Completed',
        },
    },
    wallet: {
        queueName: 'Wallet',
        charged: {
            jobName: 'Wallet-Charged',
        },
    },
    feedback: {
        queueName: 'Feedback',
        createFeedback: {
            jobName: 'Create-Feedback',
        },
    },
    engagement: {
        queueName: 'Engagement',
        interestedUsers: {
            jobName: 'Interested-Users',
        },
        usersWhoPosted: {
            jobName: 'Users-Who-Posted',
        },
        sellersWhoCompletedOrders: {
            jobName: 'Sellers-Who-Completed-Orders',
        },
        usersFromSearch: {
            jobName: 'Users-From-Search',
        },
    },
    transaction: {
        queueName: 'Transaction',
        transactionCompleted: {
            jobName: 'Transaction-Completed',
        },
    },
    updateTransactions: {
        queueName: 'Update-Transactions',
        updateOpenTransactions: {
            jobName: 'Update-Open-Transactions',
        },
    },
    penalty: {
        queueName: 'Penalty',
        penaltyApplied: {
            jobName: 'Penalty-Applied',
        },
        penaltyRemoved: {
            jobName: 'Penalty-Removed',
        },
    },
    checkout: {
        queueName: 'Checkout',
        completedBuyNowCheckout: {
            jobName: 'Complete-BuyNow-Checkout',
        },
        completedAuctionCheckout: {
            jobName: 'Complete-Auction-Checkout',
        },
    },
    action: {
        queueName: 'Action',
        actionReminder: {
            jobName: 'Use-Action-Reminder',
        },
    },
    multiSP: {
        queueName: 'MultiServicePoints',
        postItemsReady: {
            jobName: 'Post-Items-Ready',
        },
    },
    importantReminders: {
        queueName: 'Important-Reminders',
        acceptedPost: {
            jobName: 'Important-Post-Accepted',
        },
        orderCreated: {
            jobName: 'Important-Order-Created',
        },
        bidding: {
            jobName: 'Important-Post-Auction',
        },
    },
    offlineRequest: {
        queueName: 'Offline-Request',
        offlineRequestCreated: {
            jobName: 'Offline-Request-Created',
        },
    },
    chat: {
        queueName: 'Chat-Notification',
        messageSent: {
            jobName: 'Message-Sent',
        },
    },
    backendTimers: {
        queueName: 'backendTimers',
        jobName: 'backendTimers',
        delay: 120000,
    },
    backofficeTimers: {
        queueName: 'backofficeTimers',
        jobName: 'backofficeTimers',
        delay: 120000,
    },
    notificationReminder: {
        queueName: 'notificationReminder',
        jobName: 'notification-reminder',
    },
};

export default queues;

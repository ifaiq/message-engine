const messages = {
    en: {
        invitation: {
            sendInvitationByMailMailSubject: (inviterName, brandName) => `${inviterName} invited you to join ${brandName}.`,
            sendInvitationByMailMailBody: (inviterName, link) => `Dear Ms./Mr.,\n\nYou have been invited by ${inviterName} to join Mazadat (valid for 1 day). To register, please click ${'here'.link(link)}.\n\nBest Regards,\nMazadat`,
            sendInvitationByMailFromAdminMailSubject: (brandName) => `Invitation to join ${brandName}`,
            sendInvitationByMailFromAdminMailBody: (link) => `Dear Ms./Mr.,\n\nYou received an exclusive invitation (valid for 1 day) to join Mazadat. To register, please click ${'here'.link(link)}.\n\nBest Regards,\nMazadat`,
        },
        appointment: {
            appointmentComingSoonPushSubject: 'Appointment approaching!',
            appointmentComingSoonPushBody: (date, time, type, request, userType) => {
                let typeStr;
                if (type === 'returnRequest') {
                    typeStr = 'return request';
                } else if (type === 'order') {
                    if (userType === 'seller') {
                        typeStr = 'sold order';
                    } else {
                        typeStr = 'order';
                    }
                } else if (type === 'postDropOff') {
                    typeStr = 'items\' early drop off of post';
                } else if (type === 'postPickUp') {
                    typeStr = 'items\' pick up of post';
                } else {
                    typeStr = 'request';
                }
                return `Life is busy! So we just wanted to remind you of your appointment on ${date} at ${time} for your ${typeStr} #${request}. We are excited to see you!`;
            },
            appointmentComingSoonMailSubject: 'Your appointment is coming up!',
            appointmentComingSoonMailBody: (username, date, time, type, request, userType, dueAmount) => {
                let typeStr;
                if (type === 'returnRequest') {
                    typeStr = 'return request';
                } else if (type === 'order') {
                    if (userType === 'seller') {
                        typeStr = 'sold order';
                    } else {
                        typeStr = 'order';
                    }
                } else if (type === 'postDropOff') {
                    typeStr = 'items\' early drop off of post';
                } else if (type === 'postPickUp') {
                    typeStr = 'items\' pick up of post';
                } else {
                    typeStr = 'request';
                }
                return `Dear ${username},\n\nYour appointment taking place on ${date} at ${time} for the ${typeStr} #${request} is just around the corner. We are looking forward to your visit! ${dueAmount ? `Please note that your due amount to be settled is EGP ${dueAmount}.` : ''}\n\nBest Regards,\nMazadat`;
            },
            scheduleAppointmentPushSubject: (reminder) => `${reminder ? 'REMINDER' : 'IMPORTANT'}!! Book your appointment`,
            scheduleAppointmentPushBody: (type, request, date, time, userType) => {
                let typeStr;
                if (type === 'returnRequest') {
                    typeStr = 'return request';
                } else if (type === 'order') {
                    if (userType === 'seller') {
                        typeStr = 'sold order';
                    } else {
                        typeStr = 'order';
                    }
                } else {
                    typeStr = 'request';
                }
                return `Book an appointment now for the ${typeStr} #${request}. Once created, the appointment's QR code is valid for use at Mazadat's service point until ${time} on ${date}. After that, the order will be cancelled and you will be penalized.`;
            },
            scheduleAppointmentMailSubject: (reminder) => `${reminder ? 'REMINDER' : 'IMPORTANT'}!! Book your appointment`,
            scheduleAppointmentMailBody: (username, userType, actionType, date, time, type, request, link, creationDate, creationTime, postTitle, quantity, orderValue, dueAmount) => `Dear ${username},\n\nYou have recently made a ${userType === 'seller' ? 'sale' : 'purchase'} on Mazadat successfully. As such, the ${actionType === 'dropOff' ? 'drop-off' : 'pick-up'} of your items at Mazadat's service point must take place before ${time} on ${date}. Otherwise, your ${type === 'order' ? 'order' : 'return request'} will be cancelled and you will be penalized with a negative review or an indefinite ban according to Mazadat's terms and conditions.\n\n${type === 'order' ? 'Order' : 'Return Request'} ID: #${`${request}`.link(link)}\n${type === 'order' ? 'Order' : 'Return Request'} Date: ${creationDate} at ${creationTime}\nPost(s):\n${postTitle.map((post, idx) => `- ${post}, ${quantity[idx].order ? quantity[idx].order : quantity[idx]} item(s)${quantity[idx].notDroppedOff ? `, ${quantity[idx].notDroppedOff} item(s) need to be dropped off` : ''} `).join('\n')}\n${type === 'order' ? `Order Value: EGP ${orderValue}` : ''}\n\n${dueAmount ? `In order to conclude the ${type === 'order' ? 'order' : 'return request'} successfully, you need to settle an amount of EGP ${dueAmount} during the same appointment.\n\n` : ''}Please don't forget to bring your verification documents to the appointment.\n\nWe look forward to seeing you,\nMazadat`,
            buyerCanPickUpPushSubject: 'Order ready for pick up!',
            buyerCanPickUpPushBody: (orderId, date, time) => `Your order #${orderId} is ready for pick up. The appointment's QR code is valid for use at Mazadat's service point from starting now and until ${time} on ${date}. After that, the order will be cancelled and you will be penalized.`,
            buyerCanPickUpEmailSubject: 'Order ready for pick up!',
            buyerCanPickUpEmailBody: (username, date, time, request, link, creationDate, creationTime, postTitle, quantity, orderValue, dueAmount) => `Dear ${username},\n\nYou have recently made a purchase on Mazadat successfully. As such, the pick-up of your items at Mazadat's service point must take place before ${time} on ${date}. The appointment's QR code is valid for use at Mazadat's service point starting from now. Otherwise, your order will be cancelled and you will be penalized with a negative review or an indefinite ban according to Mazadat's terms and conditions.\n\nOrder ID: #${`${request}`.link(link)}\nOrder Date: ${creationDate} at ${creationTime}\nPost(s):\n${postTitle.map((post, idx) => `- ${post}, ${quantity[idx].order ? quantity[idx].order : quantity[idx]} item(s)${quantity[idx].notDroppedOff ? `, ${quantity[idx].notDroppedOff} item(s) need to be dropped off` : ''} `).join('\n')}\nOrder Value: EGP ${orderValue}\n\n${dueAmount ? `In order to conclude the order successfully, you need to settle an amount of EGP ${dueAmount} during the same appointment.\n\n` : ''}Please don't forget to bring your verification documents to the appointment.\n\nWe look forward to seeing you,\nMazadat`,
        },
        shoppingCart: {
            postExpiringOrQuantityRunningOutPushSubject: 'An item in your cart is going away!',
            postExpiringOrQuantityRunningOutPushBody: (title) => `The post "${title}" in your cart is selling out. Check it out before you miss it.`,
            postDiscountedPushSubject: 'An item in your cart is now available at a discount!',
            postDiscountedPushBody: (title, discount) => `The post "${title}" in your cart has ${discount}% OFF.`,
            postRepostedPushSubject: 'This item is available again!',
            postRepostedPushBody: (title) => `The expired post "${title}" in your cart is available again.`,
        },
        emailVerification: {
            verifyEmailPushSubject: 'Verify your email now!',
            verifyEmailPushBody: 'To have the best experience with us, complete your profile by verifying your email and choosing your avatar.',
        },
        watchlist: {
            postExpiringOrQuantityRunningOutPushSubject: 'An item on your watchlist is going away!',
            postExpiringOrQuantityRunningOutPushBody: (title) => `The post "${title}" you are watching is about to go away, hurry up to bid or buy it before it is too late.`,
            postDiscountedPushSubject: 'Your watchlist item is discounted!',
            postDiscountedPushBody: (title, discount) => `The post "${title}" you are watching is available at ${discount}% OFF. Don't miss it!`,
            postRepostedPushSubject: 'This item is available again!',
            postRepostedPushBody: (title) => `The expired post "${title}" you were watching is available again. Check it out now!`,
        },
        post: {
            postExpiredWithoutSellingPushSubject: 'IMPORTANT: Post expired!',
            postExpiredWithoutSellingPushBody: (title) => `Your post "${title}" expired. Repost it now with a single tap for free!`,
            postExpiredWithoutSellingMailSubject: 'IMPORTANT: Post expired',
            postExpiredWithoutSellingMailBody: (username, title) => `Dear ${username},\n\nYour post "${title}" has expired. You can edit and repost it for free. You can also buy one of our promotional packages to increase your chances of making a sale!\n\nBest Regards,\nMazadat`,
            postExpiredWithQuantityRemainingPushSubject: 'IMPORTANT: Post expired',
            postExpiredWithQuantityRemainingPushBody: (title) => `Your post "${title}" has expired and some of the available quantity was not sold. Repost it now for free to sell the rest!`,
            postExpiredWithQuantityRemainingMailSubject: 'IMPORTANT: Post expired',
            postExpiredWithQuantityRemainingMailBody: (username, title) => `Dear ${username},\n\nYour post "${title}" has expired and some of the available quantity was not sold. Repost it now for free to sell the rest!. You can also buy one of our promotional packages to increase your chances of making a sale!\n\nBest Regards,\nMazadat`,
            firstBidPushSubject: 'Your auction received its first bid',
            firstBidPushBody: (title) => `Congratulations! Your auction for "${title}" received its first bid.`,
            firstBidMailSubject: 'Your auction received its first bid',
            firstBidMailBody: (username, title) => `Dear ${username},\n\nCongratulations! Your auction for "${title}" received its first bid. This means your item is on its way to be sold successfully.\n\nBest Regards,\nMazadat`,
            postAcceptedPushSubject: 'Post Accepted!',
            postAcceptedPushBody: (postTitle, coinsNumber) => `Your post "${postTitle}" passed the reviewing phase successfully${coinsNumber ? `. You received ${coinsNumber} Silver coin(s).` : '.'}`,
            postDeclinedPushSubject: 'Post needs your attention!',
            postDeclinedPushBody: (postTitle) => `Your post "${postTitle}" needs to be modified by you before it can be published. Please check the revision points and resubmit the post after the necessary modifications.`,
            postRejectedPushSubject: (rejectReason) => `Post Rejected: ${rejectReason}`,
            postRejectedPushBody: (postTitle, rejectReason) => `Unfortunately, your post "${postTitle}" was rejected. Reason: ${rejectReason}.`,
            postAcceptedMailSubject: 'Your post was reviewed and accepted!',
            postAcceptedMailBody: (username, postTitle, coinsNumber) => `Dear ${username},\n\nCongratulations!\n\nWe are happy to announce that your post "${postTitle}" passed the reviewing phase successfully. This means it is now available on Mazadat${coinsNumber ? `. You received ${coinsNumber} Silver coin(s).` : '.'}\n\nBest Regards,\nMazadat`,
            postDeclinedMailSubject: 'Your post needs modifications!',
            postDeclinedMailBody: (username, postTitle) => `Dear ${username},\n\nUnfortunately, your post "${postTitle}" did not pass the reviewing phase in its current form. \nThis happens when our assessment reveals some information in your post to be inaccurate, incorrect, confusing or misleading to our users according to our Terms And Conditions (T&Cs).\n\nBut don't worry, you can review the problematic areas under the Sales Management section of your mobile application, then edit and resubmit your post. To make it easier for you, we provide you with the specific reason(s) for the rejection as well as suggestions on how to make the post quickly pass our review process.\n\nBest Regards,\nMazadat`,
            postRejectedMailSubject: 'Your post was reviewed and rejected!',
            postRejectedMailBody: (username, postTitle, rejectReason) => `Dear ${username},\n\nUnfortunately, your post "${postTitle}" did not pass the reviewing phase and had to be rejected. \n\nThis happens because of the following reason:\n${rejectReason}. \n\nIf you think we made a mistake, please contact our customer support and we will be happy to help resolve the issue.\n\nBest Regards,\nMazadat`,
            generalRejectReason: 'When we find inappropriate content or when we detect fraudulent behavior based on our Terms And Conditions (T&Cs).',
            postUnderReviewPushSubject: 'Post under review',
            postUnderReviewPushBody: (title) => `Your post "${title}" is now under review and will be available soon!`,
            postUnderReviewMailSubject: 'Post under review',
            postUnderReviewMailBody: (username, title) => `Dear ${username},\n\nYour post "${title}" is now submitted and under review. We will do our best to make it available as soon as possible. You can always check the status of the post in your Sales Management page.\n\nBest Regards,\nMazadat`,
            postRepostSuccessPushSubject: 'Post republished successfully',
            postRepostSuccessPushBody: (postTitle) => `Your post "${postTitle}" is now available again on Mazadat.`,
            postRepostSuccessMailSubject: 'Your repost was successful',
            postRepostSuccessMailBody: (username, title) => `Dear ${username},\n\nCongratulations! Your post "${title}" is now available on Mazadat. We wish you a great sale.\nIn Sales Management, you can check our boost plans that increase your chances of making a sale!\n\nBest Regards,\nMazadat`,
            postDataAppendedAcceptedPushSubject: 'Data successfully appended',
            postDataAppendedAcceptedPushBody: (postTitle) => `The appended data was successfully added to your post "${postTitle}".`,
            postDataAppendedAcceptedMailSubject: 'Data successfully appended to post',
            postDataAppendedAcceptedMailBody: (username, title) => `Dear ${username},\n\nCongratulations! The data you appended to post "${title}" has successfully been added. We wish you a great sale.\nIn Sales Management, you can check our boost plans that increase your chances of making a sale!\n\nBest Regards,\nMazadat`,
            postDataAppendedDeclinedPushSubject: 'Appended data has been declined',
            postDataAppendedDeclinedPushBody: (postTitle) => `The appended data has been declined and will not be added to your post "${postTitle}".`,
            postDataAppendedDeclinedMailSubject: 'Appended data to post declined',
            postDataAppendedDeclinedMailBody: (username, title, declineReason) => `Dear ${username},\n\nThe data you requested to append to your post "${title}" has been declined for the following reason:\n${declineReason}\nPlease follow the guidelines and try appending one more time!\n\nBest Regards,\nMazadat`,
            premiumPostFeesPaidPushSubject: 'Premium Fees Paid',
            premiumPostFeesPaidPushBody: (postId) => `We received your fees payment for post #${postId}, you can now participate in the auction`,
            premiumPostFeesPaidMailSubject: 'Premium Fees Paid',
            premiumPostFeesPaidMailBody: (username, postId, title, postLink, fees) => `Dear ${username},\n\nThis is to confirm your ${fees > 0 ? `payment of EGP ${fees}` : 'payment'} for premium post #${postId.toString().link(postLink)} titled "${title}". You can now participate in the auction.\n\nBest Regards,\nMazadat`,
            postRequestToSwitchSecuredPushSubject: 'People interested in your post!',
            postRequestToSwitchSecuredPushBody: (postId, commission) => `People want you to switch post #${postId} to secured by Mazadat with only ${commission}% commission!`,
        },
        shareableLink: {
            regeneratedPushSubject: 'Better invitation links',
            regeneratedPushBody: 'We have improved your shareable link which you can use to invite family and friends to Mazadat and collect gold M-Coins. It is now short and sweet.',
            extendedPushSubject: 'Invitation link extended',
            extendedPushBody: 'We have extended your shareable invitations link. You can now use it again to invite family and friends to Mazadat and collect gold M-Coins.',
        },
        auction: {
            auctionWonEmailSubject: 'Congratulations! Auction Won!',
            auctionWonEmailBody: (username, postTitle) => `Dear ${username},\n\nCongratulations! You won the auction for "${postTitle}". You will find it in your Biddings section of your watchlist and under the My Purchases section of your user profile. Please check it out and pick up your items as soon as possible.\n\nBest Regards,\nMazadat`,
            auctionWonSellerEmailBody: (username, date, time, request, link, creationDate, creationTime, postTitle, quantity, orderValue) => `Dear ${username},\n\nYour post "${postTitle}" was sold on Mazadat. As such, the drop-off of your items at Mazadat's service point must take place before ${time} on ${date}. Otherwise, your order will be cancelled and you will be penalized with a negative review or an indefinite ban according to Mazadat's terms and conditions.\n\nOrder ID: #${`${request}`.link(link)}\nOrder Date: ${creationDate} at ${creationTime}\nPost:\n- "${postTitle}", ${quantity} item(s)\nOrder Value: EGP ${orderValue}.\n\nPlease don't forget to bring your verification documents to the appointment.\n\nWe look forward to seeing you,\nMazadat`,
            auctionWonSellerEmailSubject: 'IMPORTANT! Book your appointment!',
            auctionWonPushSubject: 'Congratulations! Auction Won!',
            auctionWonPushBody: (postTitle) => `You won the auction for "${postTitle}". You will find it in your My Purchases section. Please track and pick up your item as soon as possible.`,
            auctionWonSellerPushSubject: 'Congratulations! Items sold!',
            auctionWonSellerPushBody: (postTitle, window) => `Your post "${postTitle}" was successfully sold. Please book an appointment now to drop off the item in the next ${window} days at one of our service points.`,
            outbidPushSubject: 'You have been outbid!',
            outbidPushBody: (newBid) => `Someone placed a higher bid. The current bid is now ${newBid}.`,
            auctionSoldByBuyNowPushSubject: 'Auction ended and post sold',
            auctionSoldByBuyNowPushBody: (postTitle) => `Unfortunately, despite being the highest bidder in the auction "${postTitle}", someone else bought the item using the Buy Now option and the auction ended.`,
            auctionSoldByBuyNowEmailSubject: 'Auction ended and post sold',
            auctionSoldByBuyNowEmailBody: (username, postTitle) => `Dear ${username},\n\nUnfortunately, despite being the highest bidder in the auction "${postTitle}", someone else bought the item using the Buy Now option and the auction ended.\n\nBest Regards,\nMazadat`,
            notifyBiddersAuctionRunningOutPushBody: (postTitle) => `Hurry up, the auction on "${postTitle}" is ending very soon!`,
            notifyBiddersAuctionRunningOutPushSubject: 'Auction ending soon!',
        },
        user: {
            userAccountUnbannedEmailSubject: 'Account reactivated!',
            userAccountUnbannedEmailBody: (username) => `Dear ${username},\n\nYour account has been reactivated!\n\nBest Regards,\nMazadat`,
            userAccountBannedEmailSubject: 'Your account has been permanently banned.',
            userAccountBannedEmailBody: (username, banningReason) => `Dear ${username},\n\nYour account has been banned for the following reason:\n\n ${banningReason}\n\nBest Regards,\nMazadat`,
            usernameUpdatedPushBody: "Your previously chosen username doesn't comply with Mazadat's Terms of Use. Therefore, it has been modified accordingly. However, you can update it from your user profile.",
            usernameUpdatedPushSubject: 'Your username has been changed.',
            verifyMailMailBody: (username, link) => `Dear ${username},\n\nPlease verify your account by clicking ${'here'.link(link)}.\n\nBest Regards,\nMazadat`,
            verifyMailOTPBody: (username, code) => `Dear ${username},\n\nPlease verify your email address by entering this code in the application:\n\n<b><font color=#0078b2>${code}</font></b>\n\n NOTE: Do not share this code with anyone.\n\nBest Regards,\nMazadat`,
            verifyMailMailSubject: 'Verify your email',
            resetPasswordMailSubject: 'Reset your password',
            resetPasswordMailBody: (username, link) => `Dear ${username},\n\nYou recently requested to reset your password. Please click ${'here'.link(link)} to reset your password.\n\nIn case you did not attempt to reset your account's password, please change it now for security reasons.\n\nBest Regards,\nMazadat`,
            accountDeletionRequestMailSubject: 'Mazadat Account Deletion Request',
            accountDeletionRequestMailBody: (username, phone, deletionDate) => `Dear ${username},\n\nYou recently requested to delete your account associated with phone number ${phone}.\nIf you did not make this request, please login to your account before ${deletionDate} to restore your account and change your password, otherwise, your account will be deleted after that date.\n\nBest Regards,\nMazadat`,
            accountDeletionRequestSMS: (deletionDate) => `Your account will be deleted on ${deletionDate}, login before that date to restore your account.`,
            accountRestorationMailSubject: 'Mazadat Account Restored',
            accountRestorationMailBody: (username, loginTime) => `Dear ${username},\n\nYour Mazadat account was successfully restored on ${loginTime}.\n\nBest Regards,\nMazadat`,
            accountRestorationSMS: (loginTime) => `Your Mazadat account was successfully restored on ${loginTime}.`,
        },
        promotionalAuction: {
            promotionalAuctionWonEmailSubject: 'Congratulations! You\'ve won a free item!',
            promotionalAuctionWonEmailBody: (username, postTitle, brandName) => `Dear ${username},\n\nCongratulations! You won the special M-Coins auction for the post "${postTitle}".\n\nMazadat values your loyalty and is happy to reward it with this free gift. A representative from ${brandName} will contact you shortly to receive your gift.\n\nBest Regards,\nMazadat`,
            promotionalAuctionWonPushSubject: 'Congratulations! You\'ve won a free item!',
            promotionalAuctionWonPushBody: (postTitle, brandName) => `You won the special M-Coins auction for the post "${postTitle}". A representative from ${brandName} will contact you shortly to receive your gift.`,
            notifyBiddersPromotionalAuctionRunningOutPushBody: (postTitle) => `Hurry up! The "${postTitle}" special auction is ending very soon!`,
            notifyBiddersPromotionalAuctionRunningOutPushSubject: 'Special auction ending soon',
        },
        returnRequest: {
            userNoShowPushSubject: 'Deadline for pick-up missed!',
            userNoShowPushBody: 'You did not show up at the service point to pick up your item(s).',
            userNoShowMailSubject: (returnRequestId) => `Return request #${returnRequestId}: Deadline for pick-up missed`,
            userNoShowMailBody: (username) => `Dear ${username},\n\nYou did not show up at the service point to pick up your item(s) from the return request.\nStorage fees may apply according to our Terms and Conditions (T&Cs), and eventually, after a certain period of time, the items might be disposed of.\n\nBest Regards,\nMazadat`,
            buyerDidNotShowBuyerMailBody: (username) => `Dear ${username},\n\nYou did not show up in time to drop off your item at the service point to proceed with the investigation. As a result, your return request has been declined and cancelled.\n\nBest Regards,\nMazadat`,
            buyerDidNotShowSellerMailBody: (username) => `Dear ${username},\n\nThe buyer did not show up at the service point to drop off the item and proceed with the investigation. As a result, the return request was declined and cancelled.\n\nBest Regards,\nMazadat`,
            buyerDidNotShowBuyerPushBody: 'Return request cancelled because you did not show up at the service point to drop off the desired item to be returned.',
            buyerDidNotShowSellerPushBody: 'Return request cancelled because of buyer no-show.',
            returnRequestCancelledMailSubject: (returnRequestId) => `Return request #${returnRequestId} has been cancelled`,
            returnRequestCancelledPushSubject: 'Return request cancelled',
            buyerDidNotRespondBuyerMailBody: (username) => `Dear ${username},\n\nThe deadline for opening an investigation has passed. Your return request was automatically declined and cancelled.\n\nBest Regards,\nMazadat`,
            buyerDidNotRespondBuyerPushBody: 'Deadline for opening an investigation missed.',
            buyerDidNotRespondSellerPushBody: 'Buyer did not open an investigation.',
            buyerDidNotRespondSellerMailBody: (username) => `Dear ${username},\n\nThe buyer did not open an investigation, so the return request was automatically declined and cancelled.\n\nBest Regards,\nMazadat`,
            sellerNoResponseMailSubject: (returnRequestId) => `Seller did not accept the return request #${returnRequestId}`,
            sellerNoResponseMailBody: (username, link) => `Dear ${username},\n\nSince the seller did not accept the return request, you have the right to open an investigation or cancel your request. Click ${'here'.link(link)} to proceed.\n\nBest Regards,\nMazadat`,
            sellerNoResponsePushSubject: 'Return request not accepted',
            sellerNoResponsePushBody: 'The seller did not accept the return request.',
            sellerRejectedMailSubject: (returnRequestId) => `Seller rejected Return Request ID #${returnRequestId}`,
            sellerRejectedMailBody: (username, link) => `Dear ${username},\n\nSince the seller rejected the return request, you have the right to open an investigation or cancel your request. Click ${'here'.link(link)} to make your decision.\n\nBest Regards,\nMazadat`,
            sellerRejectedPushSubject: 'Rejected Return Request',
            sellerRejectedPushBody: (returnRequestId) => `Seller rejected the Return Request #${returnRequestId}`,
            sellerShouldPickUpPushSubject: 'Return pick-up required',
            sellerShouldPickUpPushBody: 'You are requested to pick up your items from the service point. Check your "Returns" page for more details.',
            sellerShouldPickUpMailSubject: (returnRequestId) => `Pick-up for return request #${returnRequestId} required`,
            sellerShouldPickUpMailBody: (username, link) => `Dear ${username},\n\nYou are requested to pick up your items from the service point.\nPlease book an appointment for the pick-up by clicking ${'here'.link(link)}.\n\nBest Regards,\nMazadat`,
            investigationOpenedPushSubject: 'Investigation opened',
            investigationOpenedPushBody: (esId) => `An investigation is now open for the return request ${esId}. We will let you know the result of the investigation as soon as possible.`,
            investigationOpenedMailSubject: (returnRequestId) => `Investigation opened for return request #${returnRequestId}`,
            investigationOpenedMailBody: (username, esId) => `Dear ${username},\n\nAn investigation is now open for the return request ${esId}.\nOur experts will review the entire case as well as inspect the item in the return request if necessary according to our Terms and Conditions (T&Cs). We will let you know the outcome of the investigation as soon as possible. You can find more information under your Return details in your Returns page.\n\nBest Regards,\nMazadat`,
            sellerAcceptsPushSubjectBuyer: 'Return request accepted by seller',
            sellerAcceptsPushBodyBuyer: 'The seller accepted the return request.',
            sellerAcceptsMailSubjectBuyer: (returnRequestId) => `Return request #${returnRequestId} accepted by seller`,
            sellerAcceptsMailBodyBuyer: (username) => `Dear ${username},\n\nYour return request was accepted by the seller and you will get a refund.\n\nBest Regards,\nMazadat`,
            sellerAcceptsMailSubjectSeller: (returnRequestId) => `Item(s) in return request #${returnRequestId} picked up`,
            sellerAcceptsMailBodySeller: (username) => `Dear ${username},\n\nThis is a confirmation email that you accepted the return request.\n\nBest Regards,\nMazadat`,
            investigationOutcomePushSubject: 'Return request: Investigation complete!',
            investigationOutcomeMailSubject: (returnRequestId) => `Investigation result for return request #${returnRequestId}`,
            buyersFaultPushBodySeller: 'Mazadat concluded that the buyer has no grounds for the return request and it has been rejected.',
            buyersFaultMailBodySeller: (username) => `Dear ${username},\n\nMazadat concluded its investigation.\nThe result found that the buyer has no grounds for the return request and it has been rejected.\nAs such, the buyer should proceed with the pick-up and complete the sale transaction.\n\nBest Regards,\nMazadat`,
            buyersFaultMailBodyBuyer: (username, link) => `Dear ${username},\n\nMazadat concluded its investigation.\nThe result found that you have no grounds for the return request and it has been rejected.\nAs such, you should proceed with the pick-up and complete the sale transaction.\nPlease click ${'here'.link(link)} to book an appointment.\n\nBest Regards,\nMazadat`,
            userFaultPushBody: 'Mazadat concluded that you have no grounds for the return request. As such, please proceed with your item pick up from the Service Point.',
            sellersFaultPushBodyBuyer: 'Mazadat concluded that your return request is well-reasoned and has therefore been accepted.',
            sellersFaultMailBodyBuyer: (username) => `Dear ${username},\n\nMazadat concluded that your return request is well-reasoned and has therefore been accepted.\nAs such, the seller should proceed with the pick-up and complete the sale transaction.\n\nBest Regards,\nMazadat`,
            sellersFaultMailBodySeller: (username, link) => `Dear ${username},\n\nMazadat concluded that the buyer's return request is well-reasoned and has therefore been accepted.\nAs such, you should proceed with the pick-up and complete the sale transaction.\nPlease click ${'here'.link(link)} to book an appointment.\n\nBest Regards,\nMazadat`,
            sellerPickupMailSubject: (returnRequestId) => `Return request #${returnRequestId}: Pick-up completed`, // TODO email or push and to whom from whom?
            sellerPickupMailBody: (username) => `Dear ${username},\n\nThis is a notification to confirm that the items were picked up, and that the return request is now completed.\n\nBest Regards,\nMazadat`, // TODO email or push and to whom from whom?
            buyerPickupMailSubject: (returnRequestId) => `Return request #${returnRequestId}: Pick-up completed`, // TODO email or push and to whom from whom?
            buyerPickupMailBody: (username) => `Dear ${username},\n\nThis is a notification to confirm that the items were picked up, and that the return request is now completed.\n\nBest Regards,\nMazadat`, // TODO email or push and to whom from whom?
            returnReqCreatedMailSubject: (returnRequestId) => `Return request #${returnRequestId} created`,
            returnReqCreatedMailBody: (username, reason, link) => `Dear ${username},\n\nThe item that you sold is requested to be returned for the following reason:\n\n${reason}.\n\nPlease choose whether you will accept or reject the return request by clicking ${'here'.link(link)}.\n\nBest Regards,\nMazadat`,
            returnReqCreatedPushSubject: 'Return Request',
            returnReqCreatedPushBody: 'A return request is now open on the item that you sold.',
            sellerAcceptsMailSubject: (returnRequestId) => `Seller accepted the return request #${returnRequestId}`,
            sellerAcceptsMailBody: (username, link) => `Dear ${username},\n\nThe seller has accepted your return request.\nPlease click ${'here'.link(link)} to book an appointment to make a drop-off of your order.\n\nBest Regards,\nMazadat`,
            sellerAcceptsPushSubject: 'Accepted return request',
            sellerAcceptsPushBody: 'The seller has accepted your return request.',
            openInvestigationMailSubject: (returnRequestId) => `Opening an investigation for return request ID #${returnRequestId}`,
            openInvestigationPushSubject: 'Investigation opened on return request', // TODO ID variable not there ?
            openInvestigationBuyerMailBody: (username, link) => `Dear ${username},\n\nYou have requested to open an investigation for your return request.\nPlease click ${'here'.link(link)} to book an appointment to make a drop-off of your order for inspection.\n\nBest Regards,\nMazadat`, // TODO ID
            openInvestigationSellerMailBody: (username) => `Dear ${username},\n\nSince you have not responded to / rejected the return request, the buyer has requested to open an investigation to proceed.\n\nBest Regards,\nMazadat`,
            openInvestigationSellerPushBody: 'The buyer has requested to open an investigation to determine the faulty party.',
            returnRequestCancelledBuyerMailBody: (username) => `Dear ${username},\n\nYou have decided to cancel the return request.\n\nBest Regards,\nMazadat`,
            returnRequestCancelledSellerMailBody: (username) => `Dear ${username},\n\nThe buyer has decided to cancel the return request. Please note that the money will only be made available when no return requests are open on the order.\n\nBest Regards,\nMazadat`,
            returnRequestCancelledSellerPushBody: 'The buyer has decided to cancel the return request.',
            commentAddedToReturnRequestPushSubject: (returnRequestId) => `Return Request #${returnRequestId}: New message`,
            commentAddedToReturnRequestPushBody: (userType, message) => `The ${userType} wrote: ${message}`,
            commentRejectedPushSubject: 'Return Request: Message rejected',
            commentRejectedPushBody: (returnRequestId) => `Your comment violated Mazadat T&Cs and as a result, it will not be displayed on the return request #${returnRequestId}.`,
        },
        order: {
            amountUnlockedSellerPushSubject: 'Order completed and amount unlocked', // TODO I need the amounts here, notification commented in case of RR (message needs modification)
            amountUnlockedSellerPushBody: (orderId) => `The order #${orderId} amount was transferred to your balance and is available for use.`,
            amountUnlockedSellerMailSubject: 'Order completed confirmation',
            amountUnlockedSellerMailBody: (username, orderId) => `Dear ${username},\n\nThe order #${orderId} amount was transferred to your balance and is available for use.\nYou can either directly use it on Mazadat to purchase items, or book an appointment from your Transactions page to withdraw it from one of our service points.\n\nBest Regards,\nMazadat`,
            sellerDidNotShowBuyerPushSubject: 'Seller no-show',
            sellerDidNotShowBuyerPushBody: (orderId) => `Seller did not drop off order #${orderId} at the service point in time. The order has now been cancelled.`,
            sellerDidNotShowBuyerMailSubject: 'The seller did not show up',
            sellerDidNotShowBuyerMailBody: (username, orderId) => `Dear ${username},\n\nThe seller did not show up at the service point during the available window to drop off order #${orderId}. Hence, the order has now been cancelled. We apologize for the inconvenience and we will take the necessary measures to make sure this does not happen again.\nWe also suggest that you leave a review and rating to help other fellow users.\n\nBest Regards,\nMazadat`,
            sellerDidNotShowSellerPushSubject: 'You did not show up',
            sellerDidNotShowSellerPushBody: (orderId) => `You did not drop off order #${orderId} at the service point in time. The order has now been cancelled.`,
            sellerDidNotShowSellerMailSubject: 'You did not show up',
            sellerDidNotShowSellerMailBody: (username, orderId) => `Dear ${username},\n\nYou did not show up at the service point during the available window to drop off order #${orderId}. Hence, the order has now been cancelled.\n\nBest Regards,\nMazadat`,
            buyerNoShowBuyerPushSubject: 'Deadline for pick-up missed!',
            buyerNoShowBuyerPushBody: (orderId) => `You did not visit us at the service point to pick up your order #${orderId}.`,
            buyerNoShowBuyerMailSubject: 'Deadline for pick-up missed!',
            buyerNoShowBuyerMailBody: (username, orderId) => `Dear ${username},\n\nYou did not visit us at the service point to pick up your order #${orderId}.\n\nBest Regards,\nMazadat`,
            buyerNoShowSellerPushSubject: 'Buyer did not show up!',
            buyerNoShowSellerPushBody: (id) => `Order #${id} was not picked up on time. The order has been cancelled.`,
            buyerNoShowSellerMailSubject: 'Buyer did not show up!',
            buyerNoShowSellerMailBody: (username, orderId, link) => `Dear ${username},\n\nThe buyer missed the deadline to pick up the order #${orderId} at our service point. Following this, we have taken responsibility to penalize him and apologize for this inconvenience.\nThe order is now cancelled and no fees will be applied. We kindly ask you to book an appointment to pick up your goods.\nPlease click ${'here'.link(link)} to choose a timeslot that suits you.\n\nBest Regards,\nMazadat`,
            rejectItemBuyerPushSubject: (orderId) => `Item in order #${orderId} rejected at pickup.`, // TODO per order or per item ?? TODOOO
            rejectItemBuyerPushBody: (itemId, reason) => `Item #${itemId} rejected because of the following:\n\n${reason}.`,
            rejectItemSellerPushSubject: (orderId) => `Your order #${orderId} was rejected at pickup.`,
            rejectItemSellerPushBody: (itemId, reason) => `The buyer rejected item #${itemId} at the service point because of the following:\n\n${reason}.`,
            rejectItemBuyerMailSubject: (orderId) => `You rejected an item in order #${orderId}`,
            rejectItemBuyerMailBody: (username, itemId, postTitle, reason) => `Dear ${username},\n\nYou rejected item #${itemId} - "${postTitle}" at the service point because of the following: \n\n${reason}.\n\nPlease note that this does not cancel the order.\n\nBest Regards,\nMazadat`,
            rejectItemSellerMailSubject: (orderId) => `Buyer rejected item in order #${orderId}`,
            rejectItemSellerMailBody: (username, itemId, postTitle, reason, window, link) => `Dear ${username},\n\nThe buyer rejected item #${itemId} - "${postTitle}" at the service point because of the following:\n\n${reason}.\n\nThe above mentioned reason has been verified by our experts and is valid and upheld.\nPlease click ${'here'.link(link)} to book an appointment to pick up your item.\n\nKindly note that you have ${window} days for the pickup, or the item will be disposed of by Mazadat.\n\nBest Regards,\nMazadat`,
            pickUpBuyerPushSubject: 'Order picked up',
            pickUpBuyerPushBody: (orderId) => `Thank you for visiting us and picking up order #${orderId} at our service point.`, // TODO where is it used ?
            pickupSellerPushSubject: 'Your order was picked up!',
            pickupSellerPushBody: (orderId) => `The buyer picked up your order #${orderId} successfully from our service point.`,
            pickUpBuyerMailSubject: 'Order picked up confirmation',
            pickUpBuyerMailBody: (username, orderId) => `Dear ${username},\n\nThis is a confirmation email that you picked up order #${orderId} at our service point.\n\nBest Regards,\nMazadat`,
            pickupSellerMailSubject: 'Order picked up confirmation',
            pickupSellerMailBody: (username, orderId) => `Dear ${username},\n\nThe buyer successfully picked up the order #${orderId} from our service point.\nThe escrow period has now begun and a notification will be sent to you once it ends and the money is unlocked in your wallet.\nKindly note that any return request opened must to be resolved before the process can be completed.\n\nBest Regards,\nMazadat`,
            dropoffSellerPushSubject: (orderId) => `Order #${orderId} dropped off`,
            dropoffSellerPushBody: 'You have dropped off the items in the order successfully at our service point.',
            dropoffSellerMailSubject: (orderId) => `Order #${orderId} dropped off`,
            dropoffSellerMailBody: (username) => `Dear ${username},\n\nThis is a confirmation that you have dropped off the items in the order successfully at our service point.\n\nBest Regards,\nMazadat`,
            orderCancelledBuyerMailSubject: 'Order cancelled', // TODO: is this ok?
            orderCancelledBuyerMailBody: (username) => `Dear ${username},\n\nThe order was cancelled successfully.\n\nBest Regards,\nMazadat`, // TODO: is this okay?
            orderCancelledSellerMailSubject: 'Order cancelled', // TODO: is this ok?
            orderCancelledSellerMailBody: (username, orderId) => `Dear ${username},\n\nOrder #${orderId} has been cancelled by the buyer.`, // TODO: is this okay?
            orderCancelledSellerPushSubject: 'Order cancelled',
            orderCancelledSellerPushBody: (orderId) => `Order #${orderId} has been cancelled by the buyer.`, // TODO: is this ok?
            orderInspectionErrorPushSubject: 'Order cancelled', // TODO when is this used ?
            orderInspectionErrorPushBody: (orderId) => `Order #${orderId} was not accepted at the service point and has been cancelled.`,
            orderInspectionErrorMailSubject: (orderId) => `Order #${orderId} not accepted at the service point`,
            orderInspectionErrorMailBody: (username) => `Dear ${username},\n\nThis is a confirmation that the order was not accepted at our service point and that the order was cancelled. \nIf you think that the order was cancelled by mistake, please contact our customer support\n\nBest Regards,\nMazadat`,
            dropOffReceiptMailSubject: 'Order drop-off receipt',
            dropOffReceiptMailBody: (username, orderId, name, amount) => `Dear ${username},\n\nReceipt for Order #${orderId}${name ? `\nName: ${name}\n` : '\n'}This receipt is sent to you for the amount of EGP ${amount} because you have dropped off your package.\n\nBest Regards,\nMazadat`,
            pickUpReceiptMailSubject: 'Order pick-up receipt',
            pickUpReceiptMailBody: (username, orderId, name, amount) => `Dear ${username},\n\nReceipt for Order #${orderId}${name ? `\nName: ${name}\n` : '\n'}This receipt is sent to you for the amount of EGP ${amount} because you have picked up and paid for your package.\n\nBest Regards,\nMazadat`,
            buyNowOrderCreatedPushSubject: (ordersNumber) => `${ordersNumber > 1 ? 'Orders created successfully' : 'Order created successfully'}`,
            buyNowOrderCreatedPushBody: (ordersNumber) => `Go to your Orders page to check out your newly created ${ordersNumber > 1 ? 'orders' : 'order'}`,
            buyNowOrderCreatedEmailSubject: (ordersNumber) => `${ordersNumber > 1 ? 'Orders Created Successfully' : 'Order Created Successfully'}`,
            buyNowOrderCreatedEmailBody: (username, ordersList) => `Dear ${username},\n\nThis is to confirm that the following orders have been created: \n${ordersList.map((order) => `- ${order.orderId.toString().link(order.link)}`).join('\n')}\n\nAfter the seller for each order has dropped it off you will be notified to come pick it up from our Service Point\n\nBest Regards,\nMazadat`,
            earlyDroppedOffItemsOrderSubject: 'Order Created',
            earlyDroppedOffItemsOrderEmailBody: (username, creationDate, creationTime, postTitle, quantity, totalPrice, order, orderLink) => `Dear ${username},\n\nA purchase was recently made on some of your available items at our service point on Mazadat successfully.\n\nOrder ID: #${order.toString().link(orderLink)}\nOrder Date: ${creationDate} at ${creationTime}\nPost(s):\n${postTitle.map((post, idx) => `- ${post}, ${quantity[idx]} item(s)`).join('\n')}\nOrder Value: EGP ${totalPrice}.\n\nBest Regards,\nMazadat`,
            earlyDroppedOffItemsOrderPushBody: 'An Order was created on some of you early dropped off items.',
            orderShippedPushSubject: 'Order Dropped Off',
            orderShippedPushBody: (orderId) => `Order #${orderId} has been dropped off and will be shipped out soon.`,
            orderShippedEmailSubject: (orderId) => `Order #${orderId} has been dropped off`,
            orderShippedCashPaymentEmailBody: (username, orderId, amount, deliveryDate) => `Dear ${username},\n\nYour order #${orderId} has been dropped off at our service point and will be shipped to you by ${deliveryDate}, please prepare EGP ${amount} to pay the delivery person.\n\nBest Regards,\nMazadat`,
            orderShippedOnlinePaymentEmailBody: (username, orderId, deliveryDate) => `Dear ${username},\n\nYour order #${orderId} has been dropped off at our service point and will be shipped to you by ${deliveryDate}.\n\nBest Regards,\nMazadat`,
            orderDeliveredPushSubject: 'Order Delivered',
            orderDeliveredPushBody: (orderId) => `Order #${orderId} has been delivered.`,
            orderDeliveredEmailSubject: (orderId) => `Order #${orderId} has been delivered`,
            orderDeliveredEmailBody: (username, orderId) => `Dear ${username},\n\nYour order #${orderId} has been delivered.\n\nThanks for using Mazadat.\n\nBest Regards,\nMazadat`,
            orderCancelledByAdminPushSubject: 'Order Cancelled',
            orderCancelledByAdminPushBody: (orderId) => `Order #${orderId} has been cancelled.`,
            orderCancelledByAdminEmailSubject: (orderId) => `Order #${orderId} cancelled.`,
            orderCancelledByAdminEmailBody: (username, orderId, reason) => `Dear ${username},\n\nYour order #${orderId} has been cancelled by Mazadat.\nReason of cancellation is: ${reason}\nWe are terribly sorry for this inconvenience.\n\nBest Regards,\nMazadat`,
        },
        admin: {
            resetPasswordMailSubject: 'Reset Password',
            resetPasswordMailBody: (adminName, link) => `Dear ${adminName},\n\n You recently requested to reset your password. Please use the link ${'here'.link(link)} that is only valid for next 24 hours.\n\nBest Regards,\nMazadat`,
        },
        review: {
            reviewRejectedMailSubject: 'Review rejected',
            reviewRejectedMailBody: (username, reviewText) => `Dear ${username},\n\nYour Review ${reviewText} has been vetted and rejected by our experts as per our Terms and Conditions (T&Cs).\n\nBest Regards,\nMazadat`,
            reviewPushSubject: 'Review Order',
            reviewPushBody: (orderId) => `Please review your order #${orderId}`,
            reviewMailSubject: 'Review Order',
            reviewMailBody: (username, orderId, link) => `Dear ${username},\n\nYour Order #${orderId} is completed you can review it by using the link ${'here'.link(link)}.\n\nBest Regards,\nMazadat`,
        },
        qa: {
            questionRejectedMailSubject: 'Question Rejected',
            questionRejectedMailBody: (username, question) => `Dear ${username},\n\nYour Question ${question} has been vetted and rejected for publication by our experts as per our Terms and Conditions (T&Cs).\n\nBest Regards,\nMazadat`,
            answerRejectedMailSubject: 'Answer Rejected',
            answerRejectedMailBody: (username, answer) => `Dear ${username},\n\nYour Answer ${answer} has been vetted and rejected by our experts as per our Terms and Conditions (T&Cs).\n\nBest Regards,\nMazadat`,
            receivedQuestionPushSubject: 'Got a new question!',
            receivedQuestionPushBody: (postTitle) => `Someone has a question about your post "${postTitle}", check it out!`,
            receivedQuestionMailSubject: 'A new question is waiting for you',
            receivedQuestionMailBody: (username, postTitle) => `Dear ${username},\n\nA potential buyer has a question on your post "${postTitle}". You can find all questions asked in your User Profile - Inquiries. \nWe advise that you take the time to answer the questions as they give better insights to the potential buyer and, therefore, increasing your chances of making a sale.\n\nBest Regards,\nMazadat`,
            notifySellerAnswerOnHisPostPushBody: (username, postTitle) => `${username} answered a question related to your post "${postTitle}"`,
            notifySellerAnswerOnHisPostPushSubject: 'New response posted',
            notifyQuestionOwnerFirstAnswerBySellerPushBody: (postTitle) => `The seller responded to your question related to post "${postTitle}"`,
            notifyQuestionOwnerFirstAnswerBySellerPushSubject: 'Response from seller',
            notifyBuyerAnswerOnQuestionPushBody: (username, postTitle, answerFromAdmin) => `${answerFromAdmin ? 'Mazadat' : username} posted an answer to a question on post "${postTitle}"`,
            notifyBuyerAnswerOnQuestionPushSubject: 'New answer posted',
        },
        contactUs: {
            contactUsMailSubject: (brandName) => `Thank you for contacting ${brandName}`,
            contactUsMailBody: (username, subject, response) => `Dear ${username},\n\nRegarding the contact form you filled '${subject}', ${response}\n\nBest Regards,\nMazadat`,
        },
        gifts: {
            gift1UnlockedPushSubject: 'Gift unlocked! 0% commission!',
            gift1UnlockedPushBody: 'Congratulations! You unlocked a free gift. Post something to sell now and you won\'t pay any commission.',
            gift2And4UnlockedPushSubject: (percentage) => `Gift unlocked! A ${percentage}% discount!`,
            gift2And4UnlockedPushBody: (percentage) => `Congratulations! You unlocked a free gift. Use it now, and enjoy a combined ${percentage}% discount on your next order without restrictions.`,
            gift3UnlockedPushSubject: 'Gift unlocked! Sell on homepage',
            gift3UnlockedPushBody: 'Congratulations! You have unlocked a free gift. Apply a free elite boost now worth EGP 150 and get your post featured on the homepage.',
            gift5Part1UnlockedPushSubject: 'Gift unlocked! A 2-way voucher.',
            gift5Part1UnlockedPushBody: 'Congratulations! You unlocked a free gift! Send a EGP 100 voucher to a loved one and earn one for yourself.',
            gift5Part2UnlockedPushSubject: 'Your gift voucher is unlocked.',
            gift5Part2UnlockedPushBody: 'Congratulations the voucher you shared with a friend was used and now you can enjoy your own with a value of EGP 100.',
            earnFreeGiftPushSubject: 'Earn a free gift now',
            earnFreeGiftPushBody: 'Earn one of many gifts now to experience one of Mazadat\'s features.',
            earnFreeGiftSMSBody: (link) => `Earn one of many gifts now to experience one of Mazadat's features. ${link}`,
            gift6Part1UnlockedPushSubject: 'Your money machine.',
            gift6Part1UnlockedPushBody: (primaryValue, secondaryValue) => `Congratulations! You received a welcome gift! Send a EGP ${primaryValue} voucher to all your friends and receive EGP ${secondaryValue} back every time someone uses the voucher you gifted them. Money in your sleep!`,
            gift6Part2UnlockedPushSubject: (value) => `Cha-ching. EGP ${value} received`,
            gift6Part2UnlockedPushBody: (value, voucherCode) => `Congratulations a friend used your gift voucher and you got yourself a EGP ${value} voucher with code ${voucherCode}. Keep your money machine running! Keep piling up!`,
            gift6Part2UnlockedEmailSubject: (value) => `Cha-ching. EGP ${value} received`,
            gift6Part2UnlockedEmailBody: (value, voucherCode, expiryDate, minimumAmount) => `Congratulations a friend used your gift voucher and you got yourself a EGP ${value} voucher with code ${voucherCode}. Note, you can receive as many EGP ${value} vouchers with no limit. For example, if 100 friends use your gift, you will receive vouchers worth EGP ${value * 100} that you can use together in one go in one order with a minimum order amount is EGP ${minimumAmount}. Note: this voucher must be used before ${expiryDate}. Keep your money machine running! Keep piling up and enjoy!`,
            gift6Part2UnlockedSMSBody: (value, voucherCode) => `Congratulations a friend used your gift voucher and you got yourself a EGP ${value} voucher with code ${voucherCode}. Keep your money machine running! Keep piling up!`,
            gift6Part2RelockedPushSubject: 'Money machine needs paper!',
            gift6Part2RelockedPushBody: (earnedSoFar) => `Your gift vouchers earned you EGP ${earnedSoFar} so far! To keep receiving money, post something to sell on Mazadat now.’ Keep the machine running`,
            giftExpirySubject: 'Use It or Lose it⌛😲!',
            giftExpiryBody: (giftNumber, date) => `Enjoy your gift card on Mazadat before it expires. Your gift card #${giftNumber} is valid until ${date}`,
        },
        voucher: {
            reissuedPushTitle: 'New Voucher',
            reissuedPushBody: (code, value, percentage, expiryDate) => `Your new voucher with the following code "${code}" for ${value ? `EGP ${value}` : `${percentage}%`} is now ready for use before ${expiryDate}.`,
            reissuedMailSubject: 'New Voucher',
            reissuedMailBody: (username, code, value, percentage, expiryDate) => `Dear ${username},\n\nYour new voucher with the following code for ${value ? `EGP ${value}` : `${percentage}%`} is now ready for use before ${expiryDate}.\n\nCode: ${code}\n\nBest Regards,\nMazadat`,
        },
        dayDeal: {
            dayDealStartPushSubject: 'Day deal started',
            dayDealStartPushBody: (postTitle) => `Check out our latest day deal "${postTitle}"`,
        },
        item: {
            earlyDropOffPushTitle: 'Items dropped off early',
            earlyDropOffPushBody: (postId, numberOfItems) => `You dropped off ${numberOfItems} ${numberOfItems === 1 ? 'item' : 'items'} for post #${postId}.`,
            pickUpEarlyDropOffPushTitle: 'Items picked up',
            pickUpEarlyDropOffPushBody: (postId, numberOfItems) => `You picked up ${numberOfItems} ${numberOfItems === 1 ? 'item' : 'items'} for post #${postId}.`,
            cancelledAppointmentPushTitle: 'Cancelled Appointment',
            cancelledAppointmentPushBody: (postTitle, action) => `Your appointment to ${action === 'pickUp' ? 'pick up' : 'drop off'} items of post '${postTitle}' was cancelled.`,
            cancelledAppointmentMailSubject: 'Cancelled Appointment',
            cancelledAppointmentMailBody: (userName, date, time, postTitle, action, orderCreated) => `Dear ${userName},\n\nYour appointment on ${date} at ${time}  to ${action === 'pickUp' ? 'pick up' : 'drop off'} items of post with title '${postTitle}' was cancelled as ${orderCreated ? 'an order was created on your items' : 'your post is no longer available'}.\n\nBest Regards,\nMazadat`,
        },
        unsecuredOrder: {
            orderCreatedSubject: 'Order created successfully',
            orderCreatedPushBodyBuyer: (orderId, isAuction, postTitle) => `${isAuction ? `Congratulations! You won the auction for "${postTitle}". ` : ''}Order #${orderId} was created successfully. The seller will contact you soon to complete the purchase.`,
            orderCreatedPushBodySeller: 'Pay the required commission and reveal buyer info',
            orderCreatedMailBodyBuyer: (username, orderId, orderlink, isAuction, postTitle) => `Dear ${username},\n\n${isAuction ? `Congratulations! You won the auction for "${postTitle}". ` : ''}This is to confirm that order #${orderId.toString().link(orderlink)} has been created. We will share your contact details with the seller as soon as the seller pays the required fees.\n\nBest Regards,\nMazadat`,
            orderCreatedMailBodySeller: (username, orderId, orderlink, postTitle, date, time) => `Dear ${username},\n\nOrder #${orderId.toString().link(orderlink)} was created on your post "${postTitle}". To reveal the buyer’s contact details and complete the purchase, please pay the required fees before ${time} on ${date}.\n\nBest Regards,\nMazadat`,

            orderCancelledByBuyerSubject: 'Order Cancelled',
            orderCancelledByBuyerPushBodyBuyer: (orderId) => `Order #${orderId} was cancelled successfully`,
            orderCancelledBySellerPushBodyBuyer: (orderId) => `Order #${orderId} was cancelled by the seller`,
            orderCancelledByBuyerPushBodySeller: (orderId) => `Order #${orderId} was cancelled by the buyer`,
            orderCancelledByBuyerMailBodyBuyer: (username, orderId, orderlink) => `Dear ${username},\n\nYour order #${orderId.toString().link(orderlink)} was cancelled successfully.\n\nBest Regards,\nMazadat`,
            orderCancelledBySellerMailBodyBuyer: (username, orderId, orderlink) => `Dear ${username},\n\nOrder #${orderId.toString().link(orderlink)} was cancelled by the seller.\n\nBest Regards,\nMazadat`,
            orderCancelledByBuyerMailBodySeller: (username, orderId, orderlink) => `Dear ${username},\n\nOrder #${orderId.toString().link(orderlink)} was cancelled by the buyer.\n\nBest Regards,\nMazadat`,

            paymentReminderSubject: 'Payment Reminder',
            paymentReminderPushBody: (orderId) => `Don’t forget to pay the fees for order #${orderId} to reveal the buyer’s contact details`,
            paymentReminderMailBody: (username, fees, date, time, orderId, orderlink) => `Dear ${username},\n\nDon’t forget to pay ${fees > 0 ? `EGP ${fees}` : 'the fees'} for order #${orderId.toString().link(orderlink)} before ${time} on ${date} to reveal  the buyer’s information.\n\nBest Regards,\nMazadat`,

            sellerPaymentPushSubjectBuyer: 'One Step Closer',
            sellerPaymentMailSubjectBuyer: 'Order Updates',
            sellerPaymentPushSubjectSeller: 'Fees paid successfully',
            sellerPaymentMailSubjectSeller: 'Fees Payment Confirmation',
            sellerPaymentPushBodyBuyer: (orderId) => `The seller of order #${orderId} now has your contact details and will contact you soon to complete the purchase`,
            sellerPaymentPushBodySeller: (orderId) => `We received your fees payment for order #${orderId}, you can now reveal the buyer’s information through your orders list page`,
            sellerPaymentMailBodyBuyer: (username, orderId, orderlink) => `Dear ${username},\n\nThe seller of order #${orderId.toString().link(orderlink)} now has your contact details and will contact you soon to complete the purchase.\n\nBest Regards,\nMazadat`,
            sellerPaymentMailBodySeller: (username, fees, orderId, orderlink) => `Dear ${username},\n\nThis is to confirm your ${fees > 0 ? `payment of EGP ${fees}` : 'payment'} for order #${orderId.toString().link(orderlink)}. You can now go to your orders list page to reveal the buyer’s information.\n\nBest Regards,\nMazadat`,

            sellerDidnotPaySubject: 'Order Cancelled!',
            sellerDidnotPayPushBodyBuyer: (orderId) => `Order #${orderId} was cancelled because the seller missed the deadline for fees payment`,
            sellerDidnotPayPushBodySeller: (orderId) => `You missed the deadline for fees payment for order #${orderId}. The order has been cancelled.`,
            sellerDidnotPayMailBodyBuyer: (username, orderId, orderlink) => `Dear ${username},\n\nUnfortunately order #${orderId.toString().link(orderlink)} was cancelled because the seller missed the deadline for fees payment.\n\nBest Regards,\nMazadat`,
            sellerDidnotPayMailBodySeller: (username, orderId, orderlink) => `Dear ${username},\n\nYou missed the deadline for fees payment for order #${orderId.toString().link(orderlink)}, as a result, the order has been cancelled.\n\nBest Regards,\nMazadat`,

            buyerInformationSubject: 'Buyer Contact Details',
            buyerInformationMailBody: (username, orderId, buyername, buyerphone, orderlink) => `Dear ${username},\n\nRegarding order #${orderId.toString().link(orderlink)}, below are the buyer’s contact details:\n\nname: ${buyername}\nphone number: ${buyerphone}\n\nPlease let us know when the contact is made to complete the order.\n\nBest Regards,\nMazadat`,

            orderCompletedPushSubject: 'Order Completed!',
            orderCompletedPushBody: (orderId) => `Order #${orderId} completed successfully`,
        },
        wallet: {
            walletChargedPushSubject: 'Mazadat Wallet Charged',
            walletChargedPushBody: (amount) => `Your Mazadat wallet was charged with EGP ${amount}`,
        },
        transaction: {
            transactionPushTitle: (type) => `${type === 'Post Gift' ? 'Congrats!' : `${type} Transaction Completed`}`,
            transactionPushBody: (type, amount) => `${type === 'Post Gift' ? `EGP ${Math.abs(amount)} has been added to your wallet for your shopping in Mazadat.` : `Your ${type} transaction is completed and an amount of ${Math.abs(amount)} has been ${amount >= 0 ? 'added to' : 'subtracted from'} your balance`}`,
            transactionSmsBody: (type, amount) => `${type === 'Post Gift' ? `EGP ${Math.abs(amount)} has been added to your wallet for your shopping in Mazadat.` : `Your ${type} transaction is completed and an amount of ${Math.abs(amount)} has been ${amount >= 0 ? 'added to' : 'subtracted from'} your balance`}`,
        },
        checkout: {
            completeCheckoutSubject: 'Complete Checkout',
            completeCheckoutBuyNowBody: 'Please complete your checkout',
            completeCheckoutAuctionBody: 'Congratulations you won the auction, please complete your checkout',
        },
        action: {
            pendingActionsTitle: 'Some Actions Are Pending!',
            pendingActionsPushBody: 'Complete your pending actions & enjoy a premium experience on Mazadat.',
            pendingActionsSmsBody: (username, link) => `Dear ${username},\nThis is a reminder that you have some pending action, please check them out by clicking here: ${link}`,

        },
        penalty: {
            penaltyAppliedPushSubject: 'Penalty Fees Applied',
            penaltyAppliedPushBody: (amount) => `A penalty fee of EGP ${amount} is applied on you and will be deducted from your wallet's balance.`,
            penaltyAppliedMailSubject: 'Alert! Penalty Fees Applied',
            penaltyAppliedMailBody: (username, reason, objectId, link, amount) => {
                let penaltyReason;
                switch (reason) {
                    case 'BuyerDidNotShow':
                        penaltyReason = 'you didn\'t show to pick up order';
                        break;
                    case 'SellerDidNotDropOff':
                        penaltyReason = 'you didn\'t drop off items of order';
                        break;
                    case 'SellerDidNotPayCommission':
                        penaltyReason = 'you didn\'t pay required commission to reveal buyer of order';
                        break;
                    default:
                        penaltyReason = 'you violated our terms';
                }
                return `Dear ${username},\n\nA penalty fee is applied on you as ${penaltyReason} #${objectId.toString().link(link)} and an amount of EGP ${amount} has been deducted from your wallet's balance.\n\nBest Regards,\nMazadat`;
            },
            penaltyResetPushSubject: 'Penalty Fees Reset',
            penaltyResetPushBody: 'Penalty fee applied on you has been removed.',
        },
        multiSP: {
            postItemsReadyTitle: 'Post items pick up',
            postItemsReadyBody: (postId, spName) => `Post #${postId} items are ready to be picked up from ${spName} service point.`,
        },
        reminders: {
            approvedPostReminder: (postData = 'posts') => `To get the latest news on your ${postData}, turn on your app push notifications`,
            completedPurchases: 'To follow up on all your orders quickly, turn on your app push notifications',
            startedBiddings: 'Mazadat recommends turning on your push notifications so you are always ready to bid!',
        },
        chat: {
            messageSentTitle: 'New Message!',
            generalChatBody: (username) => `you have new message from ${username}`,
            textBody: (username, message) => `you have new text message: ${message} from ${username}.`,
            voiceBody: (username) => `you have new voice message 🎙️ from ${username}.`,
            imageBody: (username) => `you have new image 📷 from ${username}.`,
            videoBody: (username) => `you have new video 🎥 from ${username}.`,
            fileBody: (username) => `you have new file 🗃️ from ${username}.`,
        },
    },
    ar: {
        invitation: {
            sendInvitationByMailMailSubject: (inviterName, brandName) => ` ${brandName}قام بدعوتك لتنضم الي${inviterName} `,
            sendInvitationByMailMailBody: (userName, link) => `عميلنا العزيز،\n\nلقد تمت دعوتك من قبل ${userName} للانضمام لمنصة مزادات (الدعوة صالحة لمدة يوم). اضغط  ${'هنا'.link(link)} لتفعيل حسابك.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            sendInvitationByMailFromAdminMailSubject: (brandName) => `دعوة ${brandName}`,
            sendInvitationByMailFromAdminMailBody: (link) => `عميلنا العزيز،\n\nلقد استلمت دعوة حصرية (صالحة لمدة يوم) للانضمام لمنصة مزادات. اضغط  ${'هنا'.link(link)} لتفعيل حسابك.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
        },
        appointment: {
            appointmentComingSoonPushSubject: 'موعدك اقترب!',
            appointmentComingSoonPushBody: (date, time, type, request, userType) => {
                let typeStr;
                if (type === 'returnRequest') {
                    typeStr = 'طلب الإرجاع';
                } else if (type === 'order') {
                    if (userType === 'seller') {
                        typeStr = 'طلب بيع';
                    } else {
                        typeStr = 'طلب شراء';
                    }
                } else if (type === 'postDropOff') {
                    typeStr = 'تسليم سلع منشور';
                } else if (type === 'postPickUp') {
                    typeStr = 'استلام سلع منشور';
                } else {
                    typeStr = 'طلب';
                }
                return `الحياه مشاغل! لذلك أردنا تذكرتك بميعادك في الساعة ${time} من يوم ${date} ل${typeStr} #${request}. يسعدنا رؤيتك في مركز خدمة مزادات قريبا!`;
            },
            appointmentComingSoonMailSubject: 'لا تنسى موعدك!',
            appointmentComingSoonMailBody: (username, date, time, type, request, userType, dueAmount) => {
                let typeStr;
                if (type === 'returnRequest') {
                    typeStr = 'طلب الإرجاع';
                } else if (type === 'order') {
                    if (userType === 'seller') {
                        typeStr = 'طلب بيع';
                    } else {
                        typeStr = 'طلب شراء';
                    }
                } else if (type === 'postDropOff') {
                    typeStr = 'تسليم سلع منشور';
                } else if (type === 'postPickUp') {
                    typeStr = 'استلام سلع منشور';
                } else {
                    typeStr = 'طلب';
                }
                return `عميلنا العزيز ${username}،\n\nالحياه مشاغل! لذلك أردنا تذكرتك بميعادك في الساعة ${time} من يوم ${date} ل${typeStr} #${request}. ${dueAmount ? `برجاء الانتباه لوجوب سداد مبلغ ${dueAmount} جنيه مصري أثناء موعدك.` : ''}\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`;
            },
            scheduleAppointmentPushSubject: (reminder) => `${reminder ? 'تذكير' : 'هام'}!! احجز موعدك الآن`,
            scheduleAppointmentPushBody: (type, request, date, time, userType) => {
                let typeStr;
                if (type === 'returnRequest') {
                    typeStr = 'طلب الإرجاع';
                } else if (type === 'order') {
                    if (userType === 'seller') {
                        typeStr = 'طلب بيع';
                    } else {
                        typeStr = 'طلب شراء';
                    }
                } else {
                    typeStr = 'طلب';
                }
                return `احجز موعدك الآن ل${typeStr} #${request}. بمجرد الحجز سيصبح رمز الإستجابة السريعة الخاص بموعدك المحجوز صالح للاستخدام في مركز خدمة مزادات حتى الساعة ${time} من يوم ${date}. بعد ذلك سيلغى الطلب و ستعرض للجزاءات.`;
            },
            scheduleAppointmentMailSubject: (reminder) => `${reminder ? 'تذكير' : 'هام'}!! احجز موعدك الآن`,
            scheduleAppointmentMailBody: (username, userType, actionType, date, time, type, request, link, creationDate, creationTime, postTitle, quantity, orderValue, dueAmount) => {
                let typeStr;
                if (type === 'returnRequest') {
                    typeStr = 'إرجاع';
                } else if (userType === 'seller') {
                    typeStr = 'بيع';
                } else {
                    typeStr = 'شراء';
                }
                return `عميلنا العزيز ${username}،\n\nيوجد طلب ${typeStr} مفتوح لحسابك على مزادات. لإتمام الطلب بنجاح، يجب عليك ان ${actionType === 'dropOff' ? 'تسلم' : 'تستلم'} سلعك في مركز خدمة مزادات قبل الساعة ${time} من يوم ${date}. علما بأن الطلب سيلغى في حالة التخلف مما يعرضك لجزاء يتراوح بين تقييم سيء و إيقاف الحساب و المنع من إستخدام المنصة، و هذاوفقا للأحكام و الشروط.\n\nرقم الطلب: ${`${request}`.link(link)}#\nتاريخ إنشاء الطلب: ${creationDate}، ${creationTime}\nإسم الإعلان:\n${postTitle.map((post, idx) => `- ${post}، عدد ${quantity[idx].order ? quantity[idx].order : quantity[idx]} قطعة ${quantity[idx].notDroppedOff ? `، و عليك تسليم عدد ${quantity[idx].notDroppedOff} قطعة` : ''}`).join('\n')}\n${type === 'order' ? `قيمة الطلب: ${orderValue} جنيه مصري.` : ''}\n\n${dueAmount ? `لإتمام هذه المعاملة بنجاح، يجب تسديد القيمة المستحقة على حسابك و التي تبلغ ${dueAmount} جنيه مصري أثناء الزيارة القادمة.\n\n` : ''}برجاء إحضار أوراق إثبات الشخصية إلى الموعد.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`;
            },
            buyerCanPickUpPushSubject: 'الطلب جاهز للاستلام!',
            buyerCanPickUpPushBody: (orderId, date, time) => `طلبك #${orderId} جاهز للاستلام. رمز الإستجابة السريعة الخاص بموعدك المحجوز صالح للاستخدام في مركز خدمة مزادات من اللحظة وحتى الساعة ${time} من يوم ${date}. بعد ذلك سيلغى الطلب و ستعرض للجزاءات.`,
            buyerCanPickUpEmailSubject: 'الطلب جاهز للاستلام!',
            buyerCanPickUpEmailBody: (username, date, time, request, link, creationDate, creationTime, postTitle, quantity, orderValue, dueAmount) => `عميلنا العزيز ${username}،\n\nيوجد طلب مفتوح لحسابك على مزادات. لإتمام الطلب بنجاح، يجب عليك أن تستلم سلعك في مركز خدمة مزادات قبل الساعة ${time} من يوم ${date} رمز الإستجابة السريعة الخاص بموعدك المحجوز صالح للاستخدام في مركز خدمة مزادات من اللحظة. علما بأن الطلب سيلغى في حالة التخلف مما يعرضك لجزاء يتراوح بين تقييم سيء و إيقاف الحساب و المنع من إستخدام المنصة، و هذاوفقا للأحكام و الشروط.\n\nرقم الطلب: ${`${request}`.link(link)}#\nتاريخ إنشاء الطلب: ${creationDate}، ${creationTime}\nإسم الإعلان:\n${postTitle.map((post, idx) => `- ${post}، عدد ${quantity[idx].order ? quantity[idx].order : quantity[idx]} قطعة ${quantity[idx].notDroppedOff ? `، و عليك تسليم عدد ${quantity[idx].notDroppedOff} قطعة` : ''}`).join('\n')}\nقيمة الطلب: ${orderValue} جنيه مصري.\n\n${dueAmount ? `لإتمام هذه المعاملة بنجاح، يجب تسديد القيمة المستحقة على حسابك و التي تبلغ ${dueAmount} جنيه مصري أثناء الزيارة القادمة.\n\n` : ''}برجاء إحضار أوراق إثبات الشخصية إلى الموعد.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
        },
        shoppingCart: {
            postExpiringOrQuantityRunningOutPushSubject: 'أسرع الآن! يوجد إعلان في عربة تسوقك على وشك اتمام بيعه!', // TODO: too long
            postExpiringOrQuantityRunningOutPushBody: (title) => `الإعلان "${title}" في عربية التسوق الخاصة بك على وشك اتمام بيعه. قم بتفقده قبل فقدانه.`,
            postDiscountedPushSubject: 'خبر رائع! يوجد خصم على إعلان في عربة التسوق الخاصة بك!', // TODO: too long
            postDiscountedPushBody: (title, discount) => `يوجد خصم ${discount}% على الإعلان "${title}" الموجود في عربة التسوق الخاصة بك الآن.`,
            postRepostedPushSubject: 'يوجد إعلان في عربة التسوق الخاصة بك متوفر الآن مرة أخرى!', // TODO: too long
            postRepostedPushBody: (title) => `الإعلان المنتهي "${title}" في عربة التسوق الخاصة بك متوفر الآن مرة أخرى!`,
        },
        emailVerification: {
            verifyEmailPushSubject: 'اضف بريدك الإلكتروني الآن',
            verifyEmailPushBody: 'للحصول على أفضل تجربة على مزادات، قم بإكمال ملفك الشخصي عن طريق تعريف بريدك الإلكتروني وإختيار صورة لحسابك.',
        },
        watchlist: {
            postExpiringOrQuantityRunningOutPushSubject: 'أسرع الآن! يوجد إعلان في قائمة متابعتك على وشك الانتهاء!', // TODO: too long
            postExpiringOrQuantityRunningOutPushBody: (title) => `الإعلان "${title}" الذي تقوم متابعته على وشك الانتهاء الآن، أسرع وقم بالمزايدة أو شراؤه قبل فوات الأوان.`,
            postDiscountedPushSubject: 'خبر رائع! يوجد خصم على إعلان في قائمة متابعتك!', // TODO: too long
            postDiscountedPushBody: (title, discount) => `يوجد خصم ${discount}% على الإعلان "${title}" الذي تقوم بمتابعته الآن.`,
            postRepostedPushSubject: 'إعلان في قائمة متابعتك متوفر مرة أخرى!', // TODO: too long
            postRepostedPushBody: (title) => `الإعلان "${title}" المنتهي الذي كنت تتابعه متوفر الآن مرة أخرى، قم بتفقده!`,
        },
        post: {
            postExpiredWithoutSellingPushSubject: 'هام: لقد انتهت مدة الإعلان',
            postExpiredWithoutSellingPushBody: (title) => `لقد انتهت مدة إعلانك "${title}". اعد نشره الآن مجانًا.`,
            postExpiredWithoutSellingMailSubject: 'هام: لقد انتهت مدة الإعلان',
            postExpiredWithoutSellingMailBody: (username, title) => `عميلنا العزيز ${username}،\n\nلقد انتهت مدة إعلانك "${title}". يمكنك الآن تعديله وإعادة نشره مجانًا أو قم باستخدام واحدة من عروض التميز لزيادة فرص البيع!\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            postExpiredWithQuantityRemainingPushSubject: 'هام: لقد انتهت مدة الإعلان',
            postExpiredWithQuantityRemainingPushBody: (title) => `مازالت لديك كمية متوفرة في إعلانك "${title}". قم بإعادة نشره الآن مجانًا لبيع الكمية المتبقية.`,
            postExpiredWithQuantityRemainingMailSubject: 'هام: لقد انتهت مدة الإعلان',
            postExpiredWithQuantityRemainingMailBody: (username, title) => `عميلنا العزيز ${username}،\n\nمازالت لديك كمية متوفرة في إعلانك "${title}". يمكنك تعديله وإعادة نشره مجانًا أو قم باستخدام واحدة من عروض التميز لزيادة فرص البيع!\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            firstBidPushSubject: 'مزادك حصل على المزايدة الأولى',
            firstBidPushBody: (title) => `مبروك! مزادك بعنوان "${title}" حصل على المزايدة الأولى.`,
            firstBidMailSubject: 'مزادك حصل على المزايدة الأولى',
            firstBidMailBody: (username, title) => `عميلنا العزيز ${username}،\n\nمبروك! مزادك بعنوان "${title}" حصل على المزايدة الأولى. هذا يعني أن سلعتك ستباع بنجاح.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            postAcceptedPushSubject: 'إعلانك قبل للنشر',
            postAcceptedPushBody: (postTitle, coinsNumber) => `لقد اجتاز إعلانك بعنوان "${postTitle}" خطوة المراجعة بنجاح. لقد حصلت على ${coinsNumber} عملة مزادات فضية.`,
            postDeclinedPushSubject: 'إعلانك بحاجة للمراجعة',
            postDeclinedPushBody: (postTitle) => `إعلانك بعنوان "${postTitle}" بحاجة لتعديلات قبل الموافقة على نشره. برجاء مراجعةالتفاصيل في صفحة الإعلانات تحت قسم إدارة المبيعات لتعديله و إعادة تقديمه.`,
            postRejectedPushSubject: (rejectReason) => `تم رفض الإعلان: ${rejectReason}`,
            postRejectedPushBody: (postTitle, rejectReason) => `لقد تم رفض إعلانك "${postTitle}" السبب: ${rejectReason}.`,
            postAcceptedMailSubject: 'إعلانك تمت الموافقة عليه للنشر',
            postAcceptedMailBody: (username, postTitle, coinsNumber) => `عميلنا العزيز ${username}،\n\nمبروك،\n\nيسعدنا إخبارك بأن إعلانك بعنوان "${postTitle}" قد إجتاز خطوة المراجعة بنجاح و سينشر على المنصة. إعلانك معرض الآن على منصة مزادات.  لقد حصلت على ${coinsNumber} عملة مزادات فضية.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            postDeclinedMailSubject: 'إعلانك بحاجة للمراجعة',
            postDeclinedMailBody: (username, postTitle) => `عميلنا العزيز ${username}،\n\nإعلانك بعنوان "${postTitle}" بحاجة لتعديلات قبل الموافقة على نشره. برجاء مراجعة تفاصيل الإعلان من صفحة الإعلانات تحت قسم إدارة المبيعات لتعديله و إعادة تقديمه. \n\nعادةً هذا يحدث إذا وجد معلومات غير ضقيقة أو غير صحيحة أو محيرة أو مضللة للمستخدمين، و هذا التقييم يكون وفقا لشروط و أحكام المنصة. \n\nحرصًا منا على ان تكون تجربتك على المنصة سهلة و مريحة، نمدك بوصف كافي عن الاسباب و إقتراحات للتعديلات المطلوبة حتي يتم الموافقة على إعلانك بسرعة.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            postRejectedMailSubject: 'تم رفض الإعلان',
            postRejectedMailBody: (username, postTitle, rejectReason) => `عميلنا العزيز ${username}،\n\nلقد تم رفض إعلانك بعنوان "${postTitle}" أثناء مراجعته من قبل المنصة لإخلاله بالشروط والأحكام. \n\nوحدث هذا بسبب: \n${rejectReason}. \n\nحرصًا منا على ان تكون تجربتك على المنصة سهلة و مريحة، إذا كنت مقتنع أننا أخطأنا في التقييم تواصل مع خدمة العملاء و سنكون سعداء بمساعدتك.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            generalRejectReason: 'وجد محتوى الإعلان غير لائق أو يدل على سلوك غرضه التزييف أو الاحتيال، وهذا التقييم يكون وفقًا لشروط وأحكام المنصة.',
            postUnderReviewPushSubject: 'إعلانك تحت المراجعة',
            postUnderReviewPushBody: (title) => `إعلانك "${title}" قد أصبح تحت المراجعة، وسيصبح متاحًا قريبًا`,
            postUnderReviewMailSubject: 'إعلانك تحت المراجعة',
            postUnderReviewMailBody: (username, title) => `عميلنا العزيز ${username}،\n\nقد أصبح إعلانك "${title}" تحت المراجعة. سوف نفعل ما بوسعنا ليصبح متاحًا في أقرب وقت. يمكنك التحقق من حالة الإعلان في صفحة "إدارة المبيعات".\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            postRepostSuccessPushSubject: 'تم إعادة نشر إعلانك',
            postRepostSuccessPushBody: (postTitle) => `إعلانك "${postTitle}" أصبح متاح مرة آخرى للبيع على مزادات.`,
            postRepostSuccessMailSubject: 'تم إعادة نشر إعلانك',
            postRepostSuccessMailBody: (username, title) => `عميلنا العزيز ${username}،\n\nلقد تم إعادة نشر إعلانك بعنوان "${title}" بنجاح مرة اخرى. نتمنى لك بيع سلس و مربح. \n\nيمكنك متابعة أو تعديل الإعلان من صفحة "إدارة المبيعات"، حيث يمكنك أيضا شراء إحدى الباقات الترويجية لزيادة فرص البيع بأعلى سعر ممكن.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            postDataAppendedAcceptedPushSubject: 'تم إضافة البيانات',
            postDataAppendedAcceptedPushBody: (postTitle) => `تم إضافة البيانات بنجاح لمنشورك "${postTitle}".`,
            postDataAppendedAcceptedMailSubject: 'تم إضافة البيانات لمنشورك بنجاح',
            postDataAppendedAcceptedMailBody: (username, title) => `عميلنا العزيز ${username}، \n\nمبروك! لقد تم إضافة البيانات بنجاح لمنشورك "${title}". نتمنى لك بيعًا مربحًا.\nيمكنك شراء إحدى الباقات الترويجية من صفحة "إدارة المبيعات" لزيادة فرص البيع بأعلى سعر ممكن!\n\nنتطلع لرؤيتك قريبَا،\n\nفريق مزادات.`,
            postDataAppendedDeclinedPushSubject: 'تم رفض إضافة البيانات',
            postDataAppendedDeclinedPushBody: (postTitle) => `تم رفض البيانات المضافة، ولن يتم إضافتها لمنشورك "${postTitle}".`,
            postDataAppendedDeclinedMailSubject: 'تم رفض إضافة البيانات لمنشورك',
            postDataAppendedDeclinedMailBody: (username, title, declineReason) => `عميلنا العزيز ${username}،\n\nلقد تم رفض إضافة البيانات لمنشورك "${title}" للأسباب التالية:\n${declineReason}\nمن فضلك قم بمراجعة الشروط والأحكام وحاول إضافة صور أو تفاصيل مرة أخرى!\n\nنتطلع لرؤيتك قريبًا،\nفريق مزادات.`,
            premiumPostFeesPaidPushSubject: 'تم دفع الرسوم',
            premiumPostFeesPaidPushBody: (postId) => `لقد تم دفع رسوم المنشور رقم ${postId}، يمكنك الآن المشاركة في المزاد.`,
            premiumPostFeesPaidMailSubject: 'تم دفع الرسوم',
            premiumPostFeesPaidMailBody: (username, postId, title, postLink, fees) => `عزيزي ${username}،\n\nهذا لتأكيد دفعك ${fees > 0 ? `لـ${fees} ج.م للمنشور` : 'لرسوم المنشور'} رقم ${postId.toString().link(postLink)} بعنوان "${title}". يمكنك الآن المشاركة في المزاد.\n\nمع أطيب التحيات،\nفريق مزادات`,
            postRequestToSwitchSecuredPushSubject: 'الناس مهتمين بإعلانك!',
            postRequestToSwitchSecuredPushBody: (postId, commission) => `الناس طالبة إنك تحول إعلانك #${postId} لمؤمن بواسطة مزادات بعمولة ${commission}% فقط!`,
        },
        shareableLink: {
            regeneratedPushSubject: 'رابط دعواتك الجديد',
            regeneratedPushBody: 'لقد عملنا على تحسين رابط الدعوات الخاص بك الذي يمكنك استخدامه لدعوة الأهل و الأصدقاء لتجمع عملات مزادات الذهبية. الرابط الجديد قصير و سلس.',
            extendedPushSubject: 'تم إضافة دعوات لرابطك الخاص',
            extendedPushBody: 'لقد تم إضافة دعوات جديدة لرابط الدعوات الخاص بك. يمكنك الآن استخدام الدعوات المتاحة لدعوة الأهل و الأصدقاء لتحصل على عملات مزادات الذهبية.',
        },
        auction: {
            auctionWonEmailSubject: 'مبروك! لقد ربحت المزاد!',
            auctionWonEmailBody: (username, postTitle) => `عميلنا العزيز ${username}،\n\nمبروك! لقد ربحت المزاد بعنوان "${postTitle}” يمكنك العثور عليه في قسم “مشترياتي” من ملف المستخدم. برجاء مراجعته واستلام سلعتك في أقرب وقت ممكن.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            auctionWonSellerEmailSubject: 'احجز موعدك الآن',
            auctionWonSellerEmailBody: (username, date, time, request, link, creationDate, creationTime, postTitle, quantity, orderValue) => `عميلنا العزيز ${username}،\n\n لقد تم بيع اعلانك على مزادات بنجاح. لإتمام الطلب بنجاح، يجب عليك أن تسلم سلعك في مركز خدمة مزادات قبل الساعة ${time} من يوم ${date}. علما بأن الطلب سيلغى في حالة التخلف مما يعرضك لجزاء يتراوح بين تقييم سيء و إيقاف الحساب و المنع من استخدام المنصة، و هذاوفقا للأحكام و الشروط.\n\nرقم الطلب: ${`${request}`.link(link)}#\nتاريخ إنشاء الطلب: ${creationDate}، ${creationTime}\nإسم الإعلان:\n- ${postTitle}، عدد ${quantity}\n\n قيمة الطلب: ${orderValue} جنيه مصري. \n\n برجاء إحضار أوراق إثبات الشخصية إلى الموعد.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            auctionWonPushSubject: 'مبروك! لقد ربحت المزاد',
            auctionWonPushBody: (postTitle) => `ألف مبروك! لقد ربحت المزاد بعنوان "${postTitle}".برجاء مراجعته و استلامه في أقرب وقت ممكن خلال الفترة الزمنية المسموح بها. تذكر: نتيجة المزاد ملزمة لجميع الأطراف منعا للجزائات.`,
            auctionWonSellerPushSubject: 'مبروك! لقد تم شراء سلعتك',
            auctionWonSellerPushBody: (postTitle, window) => `مبروك! مزادك بعنوان "${postTitle}" قد تم بيعه بنجاح. برجاء حجز موعد الآن لإحضار السلع المباعة في الأيام ال${window} القادمة إلى أحد مراكز خدمة مزادات.`,
            outbidPushSubject: 'لقد تمت المزايدة عليك!',
            outbidPushBody: (newBid) => `السعر الآن ${newBid}... يمكنك المزايدة مرة أخرى`,
            auctionSoldByBuyNowPushSubject: 'للأسف تم بيع سلعة الزاد مباشرا',
            auctionSoldByBuyNowPushBody: (postTitle) => `لقد كنت اعلى مزايد على الزاد بعنوان "${postTitle}" و لقد تم شرائه من قبل مستخدم اخر عن طريق الشراء المباشر و ابطل المزاد.`,
            auctionSoldByBuyNowEmailSubject: 'للأسف تم بيع سلعة الزاد مباشرا',
            auctionSoldByBuyNowEmailBody: (username, postTitle) => `عميلنا العزيز ${username}،\n\nلقد كنت اعلى مزايد على الزاد بعنوان "${postTitle}" و لقد تم شرائه من قبل مستخدم اخر عن طريق الشراء المباشر و ابطل المزاد.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            notifyBiddersAuctionRunningOutPushBody: (postTitle) => `المزاد بعنوان "${postTitle}" سينتهي بعد دقائق قليلة. تفقده الآن للمزايدة.`,
            notifyBiddersAuctionRunningOutPushSubject: 'سينتهي هذا المزاد قريبا جدا',
        },
        user: {
            userAccountUnbannedEmailSubject: 'لقد تم إعادة تفعيل حسابك الشخصي!',
            userAccountUnbannedEmailBody: (username) => `عميلنا العزيز ${username}،\n\nلقد تم رفع الحظر عن حسابك الشخصي و تم إعادة تفعيله.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            userAccountBannedEmailSubject: 'لقد تم إيقاف حسابك',
            userAccountBannedEmailBody: (username, banningReason) => `عميلنا العزيز ${username}،\n\nلقد تم إيقاف حسابك إيقافا مطلق للسبب الآتي:\n\n ${banningReason}\n\nتحية طيبة،\nفريق مزادات`,
            usernameUpdatedPushBody: 'لقد عدلنا اسم المستخدم الذي اخترته سابقًا لعدم توافقه مع الشروط و الأحكام.  يرجى العلم أنه يمكنك تحديثه من صفحة المستخدم على التطبيق.',
            usernameUpdatedPushSubject: 'لقد تم تغيير اسم المستخدم الخاص بك',
            verifyMailMailBody: (username, link) => `عميلنا العزيز ${username}،\n\n برجاء تأكيد عنوان بريدك الإلكتروني باستخدام الرابط ${'هنا'.link(link)}.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            verifyMailOTPBody: (username, code) => `عميلنا العزيز ${username}،\n\n برجاء تأكيد عنوان بريدك الإلكتروني باستخدام هذا الكود:\n\n<b><font color=#0078b2>${code}</font></b>\n\n.ملحوظة:لا تشارك هذا الكود مع أي شخص.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            verifyMailMailSubject: 'اكد بريدك الالكتروني الآن',
            resetPasswordMailSubject: 'اعد ضبط كلمة السر',
            resetPasswordMailBody: (username, link) => `عميلنا العزيز ${username}،\n\n لقد طلبت إعادة ضبط كلمة السر الخاصة بحسابك على مزادات. يمكنك استخدام الرابط ${'هنا'.link(link)} لإعادة الضبط.\n\nإن لم تحاول إعادة ضبط كلمة السر برجاء تغيير كلمة السر الخاصة بك الآن لزيادة الآمان.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            accountDeletionRequestMailSubject: 'طلب حذف حساب مزادات',
            accountDeletionRequestMailBody: (username, phone, deletionDate) => `عميلنا العزيز ${username}،\n\nلقد طلبت مؤخرًا حذف حسابك المرتبط برقم الهاتف ${phone}.\nإذا لم تقدم هذا الطلب، برجاء تسجيل الدخول إلى حسابك قبل ${deletionDate} لاستعادة الحساب وتغيير كلمة المرور، وإلا سيتم حذف الحساب بعد هذا التاريخ.\n\nنتطلع لرؤيتك قريبًا،\nفريق مزادات`,
            accountDeletionRequestSMS: (deletionDate) => `سيتم حذف حسابك في ${deletionDate}، قم بتسجيل الدخول قبل هذا التاريخ لاستعادة حسابك.`,
            accountRestorationMailSubject: 'استعادة حساب مزادات',
            accountRestorationMailBody: (username, loginTime) => `عميلنا العزيز ${username}،\n\nتمت استعادة حسابك في مزادات بنجاح في ${loginTime}.نتطلع لرؤيتك قريبا،\nفريق مزادات`,
            accountRestorationSMS: (loginTime) => `تمت استعادة حسابك في مزادات بنجاح في ${loginTime}.`,
        },
        promotionalAuction: {
            promotionalAuctionWonEmailSubject: 'مبروك! لقد ربحت هدية',
            promotionalAuctionWonEmailBody: (username, postTitle, brandName) => `عميلنا العزيز ${username}،\n\nمبروك! لقد ربحت مزاد خاص بعملات مزادات لإعلان "${postTitle}”. \n\n إن مزادات تقدر جدًا دعمك وولاءك لها وتسعد لمكافئتك بهدية. سوف يقوم أحد ممثلي  ${brandName} بالتواصل معك قريبًا لتسليمها.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            promotionalAuctionWonPushSubject: 'مبروووك',
            promotionalAuctionWonPushBody: (postTitle, brandName) => `ألف مبروك! لقد ربحت المزاد الخاص "${postTitle}". أحد ممثلي خدمة عملاء ${brandName} سيتواصل معك قريبًا لتستلم هديتك.`,
            notifyBiddersPromotionalAuctionRunningOutPushBody: (postTitle) => `المزاد الخاص بعنوان "${postTitle}" سينتهي بعد دقائق قليلة. تفقده الآن للمزايدة.`,
            notifyBiddersPromotionalAuctionRunningOutPushSubject: 'سينتهي المزاد الخاص قريبا جدا',
        },
        returnRequest: {
            userNoShowPushSubject: 'لقد مضى الموعد النهائي للتسليم',
            userNoShowPushBody: 'أنت لم تحضر إلى مركز الخدمة لاستلام سلعتك.', // TODO when is this notification sent out
            userNoShowMailSubject: (returnRequestId) => `لقد تم إلغاء طلب الاسترجاع #${returnRequestId}: لمضي موعده النهائي.`,
            userNoShowMailBody: (username) => `عميلنا العزيز ${username}،\n\nلم تحضر إلى مركز الخدمة لاستلام سلعتك المسترجعة. \n قد يطبق عليك بعض الرسوم الإضافية للتخزين وفقًا للشروط والأحكام. و في حالة تعدي مدة التخزين عن الحد المنصوص عليه في الشروط و الاحكام، سيتم إعدام السلعة.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`, // TODO when is this notification sent out
            buyerDidNotShowBuyerMailBody: (username) => `عميلنا العزيز ${username}،\n\nأنت لم تحضر إلى مركز الخدمة في الوقت المحدد لتسليم السلعة حتى يتم استكمال عملية التحقيق. وبناءً على ذلك تم رفض وإلغاء طلب الاسترجاع.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            buyerDidNotShowSellerMailBody: (username) => `عميلنا العزيز ${username}،\n\n البائع لم يحضر في مركز الخدمة لتسليم السلعة المراد استرجاعها لاستكمال التحقيق. وبناءً على ذلك تم رفض وإلغاء طلب الاسترجاع.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            buyerDidNotShowBuyerPushBody: 'لقد تم إلغاء طلب الاسترجاع لعدم حضورك في مركز الخدمة لتسليم السلعة المسترجعة في الوقت المحدد.',
            buyerDidNotShowSellerPushBody: 'لقد تم إلغاء طلب الاسترجاع لعدم حضور المشتري.',
            returnRequestCancelledMailSubject: (returnRequestId) => `لقد تم إلغاء طلب الاسترجاع رقم  #${returnRequestId}.`,
            returnRequestCancelledPushSubject: 'لقد تم إلغاء طلب الاسترجاع',
            buyerDidNotRespondBuyerMailBody: (username) => `عميلنا العزيز ${username}،\n\nلقد مضى الموعد النهائي لطلب فتح تحقيق وبالتالي تم رفض وإلغاء طلب الاسترجاع تلقائيًا.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            buyerDidNotRespondBuyerPushBody: 'مضى الموعد النهائي لطلب فتح تحقيق',
            buyerDidNotRespondSellerPushBody: 'المشتري لم يطلب فتح تحقيق.',
            sellerNoResponseMailSubject: (returnRequestId) => `البائع لم يقبل طلب الاسترجاع رقم #${returnRequestId}.`,
            buyerDidNotRespondSellerMailBody: (username) => `عميلنا العزيز ${username}،\n\nالمشتري لم يطلب فتح تحقيق وبالتالي تم رفض وإلغاء طلب الاسترجاع تلقائيًا.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            sellerNoResponseMailBody: (username, link) => `عميلنا العزيز ${username}،\n\nبما أنه لم يقم البائع بقبول طلب الاسترجاع الخاص بك، فيمكنك التقديم على طلب فتح تحقيق من قبل مزادات أو إلغاء الطلب. اضغط على الرابط ${'هنا'.link(link)} لتحديد قرارك.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            sellerNoResponsePushSubject: 'عدم قبول طلب الاسترجاع',
            sellerNoResponsePushBody: 'البائع لم يقبل طلب الاسترجاع',
            sellerRejectedMailSubject: (returnRequestId) => `تم رفض طلب استرجاع رقم #${returnRequestId} من قبل البائع`,
            sellerRejectedMailBody: (username, link) => `عميلنا العزيز ${username}،\n\nبما أنه قد قام البائع برفض طلب الاسترجاع الخاص بك، فيمكنك التقديم على طلب فتح تحقيق من قبل مزادات أو إلغاء الطلب. اضغط على الرابط ${'هنا'.link(link)} لتحديد قرارك.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            sellerRejectedPushSubject: 'تم رفض طلب الاسترجاع',
            sellerRejectedPushBody: (returnRequestId) => `لقد قام البائع برفض طلب الاسترجاع #${returnRequestId}.`,
            sellerShouldPickUpPushSubject: 'من فضلك اعد استلام الطلب',
            sellerShouldPickUpPushBody: 'عليك استلام اغراضك من نقطة الخدمة. من فضلك تحقق من صفحة المرتجعات الخاصة بك للحصول على مزيد من التفاصيل.',
            sellerShouldPickUpMailSubject: (returnRequestId) => `عليك استلام طلب الاسترجاع الخاص برقم #${returnRequestId} `,
            sellerShouldPickUpMailBody: (username, link) => `عملينا العزيز ${username}،\n\nعليك استلام اغراضك من تقطة الخدمة الخاصة بنا.\nمن فضلك احجز موعد من ${'هنا'.link(link)}.\n\nمع اطيب التحيات،مزادات`,
            investigationOpenedPushSubject: 'لقد تم فتح التحقيق في الطلب الخاص بك',
            investigationOpenedPushBody: (esId) => `لقد تم فتح التحقيق في طلب الاسترجاع الخاص بك ${esId}.سوف يتم بنتيجة التحقيق في اقرب وقت ممكن. `,
            investigationOpenedMailSubject: (returnRequestId) => `لقد تم فتح التحقيق لطلب الاسترجاع #${returnRequestId}`,
            investigationOpenedMailBody: (username, esId) => `عملينا العزيز ${username}،\n\nلقد تم فتح التحقيق الان لطلب الاسترجاع الخاص بك ${esId}. \n سيقوم خبراؤنا بمراجعة الحالة بأكملها بالإضافة إلى فحص العنصر في طلب الإرجاع إذا لزم الأمر وفقًا للشروط والأحكام الخاصة بنا. سنخبرك بنتيجة التحقيق في أقرب وقت ممكن. يمكنك العثور على مزيد من المعلومات ضمن "تفاصيل الإرجاع" في صفحة "المرتجعات".\n\nمع اطيب التحيات،\nمزادات`,
            sellerAcceptsPushSubjectBuyer: 'تم قبول طلب الاسترجاع الخاص  بك من قبل البائع',
            sellerAcceptsPushBodyBuyer: 'تم قبول طلب الاسترجاع الخاص  بك من قبل البائع',
            sellerAcceptsMailSubjectBuyer: (returnRequestId) => ` طلب الاسترجاع#${returnRequestId} تم قبوله من قبل البائع`,
            sellerAcceptsMailBodyBuyer: (username) => `عملينا العزيز ${username}،\n\nلقد تم قبول طلب الارسترجاع الخاص بك من قبل البائع وسيتم استرداد اموالك.\n\nمع اطيب التحيات،\nفريق مزادات`, // TODO add value
            sellerAcceptsMailSubjectSeller: (returnRequestId) => `تم استلام طلب استرجاع المنتج الخاص برقم #${returnRequestId} `, // TODO Accept or pick-up notification ??
            sellerAcceptsMailBodySeller: (username) => `عملينا العزيز ${username}،\n\nهذه رسالة بريد إلكتروني للتأكيد على قبولك لطلب الإسترجاع.\n\nمع اطيب التحيات،\nفريق مزادات`, // TODO Accept or pick-up notification ??
            investigationOutcomePushSubject: 'طلب الاسترجاع الخاص بك: لقد انتهي التحقيق!',
            investigationOutcomeMailSubject: (returnRequestId) => `نتيجة التحقيق في طلب الاسترجاع #${returnRequestId}`,
            buyersFaultPushBodySeller: 'مزادات تعلمك ان المشتري ليس لديه اسباب للاسترجاع وتم رفض طلبك.',
            buyersFaultMailBodySeller: (username) => `عملينا العزيز ${username}،\n\nمزادات انهت تحقيها.\n وكانت النتيجة ان البائع ليس لديه اسباب للاسترجاع لذلك نعملكم انه تم رفض طلبكم.\nلذلك، يجب على المشتري استلام وإكمال معاملة البيع.\n\nمع اطيب التحيات،\nفريق مزادات`,
            buyersFaultMailBodyBuyer: (username, link) => `عملينا العزيز ${username}،\n\nمزادات انهت تحقيها.\n وكانت النتيجة ان البائع ليس لديه اسباب للاسترجاع لذلك نعملكم انه تم رفض طلبكم.\nلذلك، يجب عليك سرعة استلام المنتج واكتمال الاجراءات.\nمن فضلك استخدم الرابط ${'هنا'.link(link)} لحجز موعد.\n\nمع اطيب التحيات،\nفريق مزادات`,
            userFaultPushBody: 'مزدات لم تجد اي اسباب لاسترجاع المنتج، لذلك من فضلك استلم المنتج من اقرب مركز خدمة.',
            sellersFaultPushBodyBuyer: 'مزادات وجدت اسباب قويةوبالتالي تم قبول طلب الاسترجاع الخاص بك.',
            sellersFaultMailBodyBuyer: (username) => `عملينا العزيز ${username}،\n\nمزادات انتهت تحقيقها بأن طلب الاسترجاع له اسباب قوية ولذلك تم قبول الطلب.\nلذلك، يجب على البائع سرعة استلام المنتج واكتمال الاجراءات.\n\nمع اطيب التحيات،\nفريق مزادات`,
            sellersFaultMailBodySeller: (username, link) => `عميلنا العزيز ${username}،\n\nمزادات انهت تحقيقها بأنطلب استرجاع المشتري له اسباب جيدة وبالتالي تم قبوله.\nلذلك، يجب على البائع سرعة استلام المنتج واكتمال الاجراءات.\nمن فضلك استخدم الرابط ${'هنا'.link(link)} لحجز موعد.\n\nمع اطيب التحيات،\nفريق مزادات`,
            sellerPickupMailSubject: (returnRequestId) => `طلب الاسترجاع #${returnRequestId}: تم الاستلام`, // TODO email or push and to whom from whom?
            sellerPickupMailBody: (username) => `عميلنا العزيز ${username}،\n\nهذا إشعار للتأكيد انه تم استلام المنتج الخاص بكم وتم اكتمال طلب الاسترجاع .\n\nمع اطيب التحيات،\nفريق مزادات`, // TODO email or push and to whom from whom?
            buyerPickupMailSubject: (returnRequestId) => `طلب الاسترجاع #${returnRequestId}: تم الاستلام`, // TODO email or push and to whom from whom?
            buyerPickupMailBody: (username) => `عملينا العزيز ${username}،\n\nهذا إشعار للتأكيد على أن العناصر قد تم استلامها ، وأن طلب الإسترجاع قد اكتمل الآن.\n\nمع اطيب التحيات،\nفريق مزادات`, // TODO email or push and to whom from whom?
            returnReqCreatedMailSubject: (returnRequestId) => `تم إنشاء طلب الاسترجاع برقم#${returnRequestId} `,
            returnReqCreatedMailBody: (username, reason, link) => `عميلنا العزيز ${username}،\n\n:\n\nيُطلب إسترجاع العنصر الذي قمت ببيعه للسبب التالي"${reason}".\n\nمن فضلك اختار اذا كنت تقبل أو ترفض طلب الاسترجاع من الرابط ${'هنا'.link(link)}.\n\nمع اطيب التحيات،\nفريق مزادات`,
            returnReqCreatedPushSubject: 'طلب استرجاع',
            returnReqCreatedPushBody: 'لقد تم فتح طلب استرجاع خاص بالمنتج الذي تم شرائه.',
            sellerAcceptsMailSubject: (returnRequestId) => `لقد تم قبول طلب الاسترجاع الخاص بك من قل البائع #${returnRequestId}`,
            sellerAcceptsMailBody: (username, link) => `عملينا العزيز ${username}،\n\nلقد تم قبول طلب الاسترجاع من قبل البائع.\nمن فضلك اختار موعد من الرابط ${'هنا'.link(link)} لتسليم المنتج.\n\nمع اطيب التحيات،\nفريق مزادات`,
            sellerAcceptsPushSubject: 'تم قبول طلب الاسترجاع الخاص بك',
            sellerAcceptsPushBody: 'لقد تم قبول طلب الاسترجاع الخاص بك من قبل البائع.',
            openInvestigationMailSubject: (returnRequestId) => `لقد تم بدء التحيقي في طلب الاسترجاع رقم #${returnRequestId}`,
            openInvestigationPushSubject: 'تم فتح التحيقي في طلب الاسترجاع الخاص بك', // TODO ID variable not there ?
            openInvestigationBuyerMailBody: (username, link) => `عملينا العزيز ${username}،\n\nلقد طلبت فتح تحقيق لطلب الاسترجاع الخاص بك.\nيرجى استخدام الرابط ${'هنا'.link(link)} لحجز موعد لتسليم طلبك للفحص.\n\nمع اطيب التحيات،\nفريق مزادات`, // TODO ID
            openInvestigationSellerMailBody: (username) => `عملينا العزيز ${username}،\n\nبما أنك لم ترد على / رفض طلب الإسترجاع ، فقد طلب المشتري فتح تحقيق للمتابعة.\n\nمع اطيب التحيات،\nفريق مزادات`,
            openInvestigationSellerPushBody: 'طلب المشتري فتح تحقيق لتحديد الطرف المعيب.',
            returnRequestCancelledBuyerMailBody: (username) => `عملينا العزيز ${username}،\n\nلقد قررت انهاء طلب الاسترجاع الخاص بك.\n\nمع اطيب التحيات،\nفريق مزادات`,
            returnRequestCancelledSellerMailBody: (username) => `عملينا العزيز ${username}،\n\nقرر المشتري إلغاء طلب الإسترجاع.يرجى ملاحظة أنه لن يتم اتاحة المبلغ المدفوع إلا في حالة عدم فتح طلب إسترجاع على الطلب.\n\nمع اطيب التحيات،\nفريق مزادات`,
            returnRequestCancelledSellerPushBody: 'لقد قرر البائع انتهاء طلب الاسترجاع.',
            commentAddedToReturnRequestPushSubject: (returnRequestId) => `طلب الاسترجاع #${returnRequestId}: رسالة جديدة`,
            commentAddedToReturnRequestPushBody: (userType, message) => `كتب ${userType === 'buyer' ? 'المشتري' : 'البائع'}: "${message}"`,
            commentRejectedPushSubject: 'طلب استرجاع: تم رفض التعليق',
            commentRejectedPushBody: (returnRequestId) => `لقد انتهك تعليقك شروط وأحكام مزادات، لذلك لن يتم عرضه على طلب الاسترجاع #${returnRequestId}`,
        },
        order: {
            amountUnlockedSellerPushSubject: 'لقد اتمم الطلب وتم الإفراج عن المبلغ.', // TODO I need the amounts here
            amountUnlockedSellerPushBody: (orderId) => `لقد تم تحويل مبلغ الطلب #${orderId} لحسابك ومتاح للاستخدام الآن.`,
            amountUnlockedSellerMailSubject: 'تأكيد اتمام عملية الطلب.',
            amountUnlockedSellerMailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nلقد تم تحويل مبلغ الطلب #${orderId} لحسابك ومتاح للاستخدام. \n يمكنك استخدامه على مزادات مباشرةً لاقتناء مشتريات أخرى أو حجز ميعاد من صفحة “المعاملات” لسحب المبلغ من إحدى مراكز الخدمة.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            sellerDidNotShowBuyerPushSubject: 'عدم حضور البائع.',
            sellerDidNotShowBuyerPushBody: (orderId) => `البائع لم يسلم الطلب #${orderId} لمركز الخدمة في الموعد المحدد.`,
            sellerDidNotShowBuyerMailSubject: 'عدم حضور البائع',
            sellerDidNotShowBuyerMailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nلقد تغيب البائع عن تسليم الطلب #${orderId} لمركز الخدمة في الفترة المحددة. نحن نعتذر عن الإزعاج وسوف نحرص على اتخاذ الاحتياطات اللازمة لتجنب حدوث ذلك مرة أخرى. \n نحن أيضًا ننصح بكتابة تقييم لمساعدة المستخدمين الآخرين.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            sellerDidNotShowSellerPushSubject: 'أنت لم تحضر',
            sellerDidNotShowSellerPushBody: (orderId) => `أنت لم تسلم الطلب #${orderId} لمركز الخدمة في الموعد المحدد.`,
            sellerDidNotShowSellerMailSubject: 'أنت لم تحضر',
            sellerDidNotShowSellerMailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nأنت لم تقم بزيارتنا في مركز الخدمة كي تسلم الطلب #${orderId} في الفترة المحددة.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            buyerNoShowBuyerPushSubject: 'تجاوز الموعد النهائي لتسليم الطلب',
            buyerNoShowBuyerPushBody: (orderId) => `أنت لم تقم بزيارتنا في مركز الخدمة كي تستلم طلبك #${orderId}.`,
            buyerNoShowBuyerMailSubject: 'تجاوز الموعد النهائي لتسليم الطلب',
            buyerNoShowBuyerMailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nأنت لم تقم بزيارتنا في مركز الخدمة كي تستلم طلبك #${orderId}.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            buyerNoShowSellerPushSubject: 'عدم حضور المشتري.',
            buyerNoShowSellerPushBody: (id) => `لم يتم تسليم الطلب #${id} وقد تم إلغاؤه.`,
            buyerNoShowSellerMailSubject: 'عدم حضور المشتري.',
            buyerNoShowSellerMailBody: (username, orderId, link) => `عميلنا العزيز ${username}،\n\nلقد تجاوز المشتري الموعد النهائي لاستلام الطلب #${orderId} من مركز الخدمة. طبقًا لذلك تتحمل مزادات مسؤولية تغريمه ونعتذر عن الإزعاج. \n سيتم الآن إلغاء الطلب بدون أن تتحمل أي مصاريف. برجاء التكرم بتحديد موعد لاستلام طلبك. \nبرجاء استخدام الرابط  ${'هنا'.link(link)} لتحديد الفترة الزمنية المناسبة لك.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            rejectItemBuyerPushSubject: (orderId) => `لقد تم رفض سلعة في الطلب #${orderId} عند التسليم.`, // TODO per order or per item ??
            rejectItemBuyerPushBody: (itemId, reason) => `لقد رفضت السلعة #${itemId} بسبب \n\n"${reason}".`,
            rejectItemSellerPushSubject: (orderId) => `لقد رفض طلبك #${orderId} عند التسليم.`,
            rejectItemSellerPushBody: (itemId, reason) => `لقد رفض المشتري استلام السلعة #${itemId} من مركز الخدمة بسبب \n\n"${reason}".`,
            rejectItemBuyerMailSubject: (orderId) => `لقد رفضت استلام السلعة من طلب #${orderId}.`,
            rejectItemBuyerMailBody: (username, itemId, postTitle, reason) => `عميلنا العزيز ${username}،\n\nلقد رفضت استلام سلعة #${itemId} - ${postTitle} من مركز الخدمة بسبب \n\n"${reason}”. \n\n برجاء ملاحظة أن ذلك لا يلغي الطلب.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            rejectItemSellerMailSubject: (orderId) => `لقد رفض المشتري السلعة من طلب #${orderId}`,
            rejectItemSellerMailBody: (username, itemId, postTitle, reason, window, link) => `عميلنا العزيز ${username}،\n\nلقد رفض المشتري استلام السلعة #${itemId} - ${postTitle} من مركز الخدمة بسبب \n\n"${reason}”.  \n\n السبب المذكور قد اعتمد من قبل خبرائنا ويعد سليم وقائم. \nبرجاء استخدام الرابط  ${'هنا'.link(link)} لحجز ميعاد لاستلام سلعتك.\n\n يرجى مراعاة وجود عدد ${window} أيام محددة لاستلام السلعة وإلا تخضع لملكية الشركة.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            pickUpBuyerPushSubject: 'استلام الطلب',
            pickUpBuyerPushBody: (orderId) => `نشكرك على زيارتنا واستلام طلبك رقم #${orderId} من مركز خدمة مزادات.`, // TODO where is it used ?
            pickupSellerPushSubject: 'تم تسليم طلبك!',
            pickupSellerPushBody: (orderId) => `لقد استلم المشتري سلعتك #${orderId} بنجاح من مركز خدمة مزادات.`,
            pickUpBuyerMailSubject: 'تأكيد استلام الطلب',
            pickUpBuyerMailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nهذا البريد الإلكتروني لتأكيد استلامك لطلب رقم  #${orderId} من مركز خدمة مزادات.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            pickupSellerMailSubject: 'تأكيد تسليم الطلب',
            pickupSellerMailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nلقد استلم المشتري طلب الشراء رقم  #${orderId} بنجاح من مركز الخدمة. \n فترة تعليق المعاملة قد بدأت الآن وسيتم إخطارك فور إنتهائها والإفراج عن مبلغ الطلب في حسابك. \n برجاء مراعاة أنه لا تتم المعاملة في وجود طلب استرجاع قائم.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            dropoffSellerPushSubject: (orderId) => `لقد سلمت طلب بيع #${orderId}`,
            dropoffSellerPushBody: 'لقد تم تسليم طلب البيع في مركز خدمة مزادات بنجاح.',
            dropoffSellerMailSubject: (orderId) => `لقد سلمت طلب بيع #${orderId}`,
            dropoffSellerMailBody: (username) => `عميلنا العزيز ${username}،\n\nلقد تم تسليم سلعك المباعه الخاصة بطلب بيع المذكور اعلاه في إحدي مراكز خدمة مزادات. شكرًا لك على التزامك بالوقت المتاح.\n\nسعداء بخدمتك\nفريق مزادات`,
            orderCancelledBuyerMailSubject: 'تم إلغاء الطلب', // TODO: is this ok?
            orderCancelledBuyerMailBody: (username) => `عميلنا العزيز ${username}،\n\nتم إلغاء الطلب بنجاح\n\nسعداء بخدمتك،\nفريق مزادات`, // TODO: is this okay?
            orderCancelledSellerMailSubject: 'تم إلغاءالطلب', // TODO: is this ok?
            orderCancelledSellerMailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nالطلب الخاص بك #${orderId} تم انهائه من قبل المشتري`, // TODO: is this ok?
            orderCancelledSellerPushSubject: 'تم إلغاءالطلب',
            orderCancelledSellerPushBody: (orderId) => `الطلب رقم #${orderId} تم إلغاؤه من قبل المشتري`, // TODO: is this ok?
            orderInspectionErrorPushSubject: 'تم إلغاء الطلب', // TODO when is this used ?
            orderInspectionErrorPushBody: (orderId) => `الطلب رقم #${orderId} لم يتم قبوله في نقطة الخدمة وتم إلغاؤه`,
            orderInspectionErrorMailSubject: (orderId) => `الطلب رقم #${orderId}غير مقبول في نقطة الخدمة`,
            orderInspectionErrorMailBody: (username) => `عميلنا العزيز ${username}،\n\nهذا تأكيد على عدم قبول الطلب في مركز خدمتنا وإلغاء الطلب. \nإذا كنت تعتقد أن الطلب قد تم إلغاؤه عن طريق الخطأ ، فيرجى الاتصال بدعم العملاء\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            dropOffReceiptMailSubject: 'إيصال تسليم الطلب',
            dropOffReceiptMailBody: (username, orderId, name, amount) => `عميلنا العزيز ${username}،\n\nإيصال الطلب #${orderId}${name ? `\nالاسم: ${name}\n` : '\n'}يتم إرسال هذا الإيصال إليك بمبلغ جنيه مصري ${amount} لأنك قمت بتسليم الطرد الخاص بك.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            pickUpReceiptMailSubject: 'إيصال استلام الطلب',
            pickUpReceiptMailBody: (username, orderId, name, amount) => `عميلنا العزيز ${username}،\n\nفاتورة الطلب #${orderId}${name ? `\nالاسم: ${name}\n` : '\n'}يتم إرسال هذا الإيصال إليك بمبلغ جنيه مصري ${amount} لانك قمت باستلام المنتج الخاص بك و دفعت ثمنه.\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            buyNowOrderCreatedPushSubject: (ordersNumber) => `${ordersNumber > 1 ? 'تم إنشاء الطلبات بنجاح' : 'تم إنشاء الطلب بنجاح'}`,
            buyNowOrderCreatedPushBody: (ordersNumber) => `انتقل إلى صفحة الطلبات الخاصة بك للتحقق من ${ordersNumber > 1 ? 'طلباتك' : 'طلبك'}`,
            buyNowOrderCreatedEmailSubject: (ordersNumber) => `${ordersNumber > 1 ? 'تم إنشاء الطلبات بنجاح' : 'تم إنشاء الطلب بنجاح'}`,
            buyNowOrderCreatedEmailBody: (username, ordersList) => `عميلنا العزيز ${username}،\n\nهذا لتأكيد أنه تم إنشاء الطلبات التالية: \n${ordersList.map((order) => `- ${order.orderId.toString().link(order.link)}`).join('\n')}\n\nبعد قيام البائع بتسليم الطلب ، سيتم إخطارك بالحضور لاستلامه من نقطة الخدمة لدينا\n\nنتطلع لرؤيتك قريبا،\nفريق مزادات`,
            earlyDroppedOffItemsOrderSubject: 'إنشاء طلب',
            earlyDroppedOffItemsOrderEmailBody: (username, creationDate, creationTime, postTitle, quantity, totalPrice, order, orderLink) => `عميلنا العزيز ${username}،\n\nلقد تم إنشاء طلب على بعض قطعك المعروضة في مركز خدمتنا.\n\n رقم الطلب#${order.toString().link(orderLink)}\n تاريخ الطلب: ${creationDate} في ${creationTime}\nمنشورات: \n${postTitle.map((post, idx) => `- ${post}، عدد ${quantity[idx]}`).join('\n')}\n قيمة الطلب${totalPrice} جنيها\n\nاطيب التمنيات\nفريق مزادات.`,
            earlyDroppedOffItemsOrderPushBody: 'لقد تم إنشاء طلب على بعض قطعك المتاحة في مركز خدمتنا',
            orderShippedPushSubject: 'وصل طلبك إلى مركز الخدمة',
            orderShippedPushBody: (orderId) => `قد تم استلام طلبك #${orderId} وسوف يتم شحنه قريبًا.`,
            orderShippedEmailSubject: (orderId) => `قد تم استلام طلبك #${orderId} من البائع`,
            orderShippedCashPaymentEmailBody: (username, orderId, amount, deliveryDate) => `عميلنا العزيز ${username}،\n\nلقد تم استلام طلبك #${orderId} في مركز خدمتنا وسوف يتم شحنه بحلول ${deliveryDate}، من فضلك جهز ${amount} جنيهًا لتدفعها لعامل التوصيل.\n\nمع أطيب التمنيات\nفريق مزادات`,
            orderShippedOnlinePaymentEmailBody: (username, orderId, deliveryDate) => `عميلنا العزيز ${username}،\n\nلقد تم استلام طلبك #${orderId} في مركز خدمتنا وسوف يتم شحنه بحلول ${deliveryDate}.\n\nمع أطيب التمنيات\nفريق مزادات`,
            orderDeliveredPushSubject: 'تم توصيل طلبك',
            orderDeliveredPushBody: (orderId) => `تم توصيل طلبك #${orderId}.`,
            orderDeliveredEmailSubject: (orderId) => `تم توصيل طلبك #${orderId}`,
            orderDeliveredEmailBody: (username, orderId) => `عميلنا العزيز ${username}،\n\nلقد تم توصيل طلبك #${orderId} بنجاح.\n\nشكرًا لاستخدامك مزادات.\n\nمع أطيب التمنيات\nفريق مزادات`,
            orderCancelledByAdminPushSubject: 'تم إلغاءالطلب',
            orderCancelledByAdminPushBody: (orderId) => `الطلب رقم #${orderId} تم إلغاؤه من قبل مزادات.`,
            orderCancelledByAdminEmailSubject: (orderId) => `الطلب رقم #${orderId} تم إلغاؤه`,
            orderCancelledByAdminEmailBody: (username, orderId, reason) => `عميلنا العزيز ${username}،\n\n لقد تم إلغاء طلبك #${orderId} من قبل مزادات.\nسبب الإلغاء: ${reason}\nنأسف على الإزعاج.\n\nأطيب التمنيات،\nفريق مزادات.`,
        },
        review: {
            reviewRejectedMailSubject: 'تم رفض المراجعة',
            reviewRejectedMailBody: (username, reviewText) => `عميلنا العزيز ${username}،\n\nمراجعة طلبك "${reviewText}" تم فحصها ورفضها من قبل خبرائنا وفقًا للشروط والأحكام الخاصة بنا.\n\nسعداء بخدمتك،\nفريق مزادات`,
            reviewPushSubject: 'راجع الطلب',
            reviewPushBody: (orderId) => `لقد تم اكتمال طلبك #${orderId} برجاء مراجعته`,
            reviewMailSubject: 'راجع طلب',
            reviewMailBody: (username, orderId, link) => ` عميلنا العزيز ${username}،\n\nلقد تم اكتمال طلبك #${orderId} يمكنك الان تقييم طلبك من خلال الرابط ${'هنا'.link(link)}.\n\nسعداء بخدمتك،\nفريق مزادات`,
        },
        admin: {
            resetPasswordMailSubject: 'إعادة تعيين كلمة المرور',
            resetPasswordMailBody: (adminName, link) => `عميلنا العزيز ${adminName}،\n\n لقد طلبت مؤخرًا إعادة تعيين كلمة المرور الخاصة بك. الرجاء استخدام الرابط  ${'هنا'.link(link)} الذي يصلح فقط لمدة 24 ساعة القادمة.\n\nسعداء بخدمتك،\nفريق مزادات`,
        },
        qa: {
            questionRejectedMailSubject: 'تم رفض السؤال',
            questionRejectedMailBody: (username, question) => `عميلنا العزيز ${username}،\n\nسؤالك "${question}"تم فحصه ورفضه للنشر من قبل خبرائنا وفقًا للشروط والأحكام الخاصة بنا.\n\nسعداء بخدمتك،\nفريق مزادات`,
            answerRejectedMailSubject: 'تم رفض الإجابة',
            answerRejectedMailBody: (username, answer) => `عميلنا العزيز ${username}،\n\nاجابتك "${answer}"تم فحصه ورفضه للنشر من قبل خبرائنا وفقًا للشروط والأحكام الخاصة بنا.\n\nسعداء بخدمتك،\nفريق مزادات`,
            receivedQuestionPushSubject: 'لقد استلمت سؤال جديد!',
            receivedQuestionPushBody: (postTitle) => `شخص ما له سؤال على منشورك "${postTitle}"، تحقق من ذلك!`,
            receivedQuestionMailSubject: 'سؤال جديد بانتظارك',
            receivedQuestionMailBody: (username, postTitle) => `عميلنا العزيز ${username}،\n\nالمشتري المحتمل لديه سؤال على منشورك "${postTitle}". يمكنك أن تجد جميع الأسئلة المطروحة في الخاص بك "ملف المستخدم - استفسارات". \nننصحك بأخذ الوقت الكافي للإجابة على الأسئلة لأنها تقدم رؤى أفضل للمشتري المحتمل وبالتالي تزيد من فرص مبيعاتك.\n\nسعداء بخدمتك،\nفريق مزادات`,
            notifySellerAnswerOnHisPostPushBody: (username, postTitle) => `${username} أجاب على سؤال متعلق بمنشورك "${postTitle}"`,
            notifySellerAnswerOnHisPostPushSubject: 'تم إضافة إجابة جديدة',
            notifyQuestionOwnerFirstAnswerBySellerPushBody: (postTitle) => `أجاب البائع على سؤالك المتعلق بالمنشور "${postTitle}"`,
            notifyQuestionOwnerFirstAnswerBySellerPushSubject: 'إجابة من البائع',
            notifyBuyerAnswerOnQuestionPushBody: (username, postTitle, answerFromAdmin) => `${answerFromAdmin ? 'مزادات' : username} نشر إجابة على سؤال في المنشور "${postTitle}"`,
            notifyBuyerAnswerOnQuestionPushSubject: 'تم نشر إجابة جديدة',
        },
        contactUs: {
            contactUsMailSubject: (brandName) => `شكرا لك على تواصلك بنا ${brandName}`,
            contactUsMailBody: (username, subject, response) => `عميلنا العزيز ${username}،\n\nبخصوص نموذج الاتصال الذي ملأته '${subject}'، ${response}\n\nسعداء بخدمتك،\nMazadat`,
        },
        gifts: {
            gift1UnlockedPushSubject: 'هدية متاحة! بيع بعمولة ٠%',
            gift1UnlockedPushBody: 'مبروك، لقد فتحت هدية جديدة! انشر إعلانك الآن على مزادات و بيع سلعتك بدون عمولة، و احتفط بكل المكسب. ',
            gift2And4UnlockedPushSubject: (percentage) => `هدية متاحة! اشتري بخصم ${percentage}%`,
            gift2And4UnlockedPushBody: (percentage) => `مبروك، لقد فتحت هدية جديدة! استمتع الآن بخصم ${percentage}% قابل للجمع مع تخفيض اخر على طلب شرائك القادم بدون اي قيود.`,
            gift3UnlockedPushSubject: 'هدية متاحة! إعلن على الرئيسية',
            gift3UnlockedPushBody: 'مبروك، لقد فتحت هدية جديدة! روج إعلانك الآن على صفحة مزادات الرئيسية بباقة ترويجية مجانية قدرها ١٥٠ جنيه.',
            gift5Part1UnlockedPushSubject: 'هدية متاحة! كوبون مزدوج ب١٠٠ جنيه',
            gift5Part1UnlockedPushBody: 'مبروك، لقد فتحت هدية جديدة! اهدي من تحب كوبون بقيمة ١٠٠ جنيه، و اكسب واحد بنفس القيمة عندما يستخدم صديقك هديته.',
            gift5Part2UnlockedPushSubject: 'كوبونك الخاص متاح الآن',
            gift5Part2UnlockedPushBody: 'مبروك، لقد فتحت هدية جديدة! لقد استخدم صديقك الكوبون الذي اهديته إياه، دورك الآن لتستمع بكوبونك الذي أصبح متاح بقيمة ١٠٠ جنيه.',
            earnFreeGiftPushSubject: 'استمتع بهدية مجانية',
            earnFreeGiftPushBody: 'اكسب الآن واحدة من هدايا متعددة لتستمتع بإحدى خواص مزادات مجانا.',
            earnFreeGiftSMSBody: (link) => `اكسب واحدة من هدايا متعددة لتستمتع الآن بإحدى خواص مزادات مجانا. ${link}`,
            gift6Part1UnlockedPushSubject: 'هديتك جاهزة! شجرة فلوس',
            gift6Part1UnlockedPushBody: (primaryValue, secondaryValue) => `مبروك، مزادات بترحب بك بهدية! اهدي كل اصحابك كوبون بقيمة ${primaryValue} جنيه، و اكسب واحد ب${secondaryValue} جنيه مع كل مرة يستخدم صديق لك هديته.`,
            gift6Part2UnlockedPushSubject: (value) => `تشتشنج… وصلك ${value} جنيه هدية`,
            gift6Part2UnlockedPushBody: (value, voucherCode) => `مبروك، لقد استخدم صديق من اصدقائك الكوبون هديتك له.  و  الآن وصلك كوبون بقيمة ${value} جنيه لك بكود ${voucherCode} . الشجرة بتثمر! جمع اكثر.`,
            gift6Part2UnlockedEmailSubject: (value) => `تشتشنج… وصلك ${value} جنيه هدية`,
            gift6Part2UnlockedEmailBody: (value, voucherCode, expiryDate, minimumAmount) => `مبروك، لقد استخدم صديق من اصدقائك الكوبون هديتك له. و الآن وصلك كوبون بقيمة ${value} جنيه لك بكود ${voucherCode}. يمكنك استقبال عدد غير محدود من كوبونات ال${value} جنيه. على سبيل المثال، لو ١٠٠ من اصحابك  استخدموا هديتك لهم، ستستقبل انت كوبونات قيمتحا ${value * 100} جنيه و يمكن جمعهم و استخدامهم سويا مرة واحدة في طلب شراء واحد قيمته لا تقل عن ${minimumAmount} جنيه. ملحوظة: يجب استخدام هذا الكوبون قبل يوم .${expiryDate} الشجرة بتثمر! جمع اكثر و استمتع.`,
            gift6Part2UnlockedSMSBody: (value, voucherCode) => `مبروك، لقد استخدم صديق من اصدقائك الكوبون هديتك له.  و  الآن وصلك كوبون بقيمة ${value} جنيه لك بكود ${voucherCode} . الشجرة بتثمر! جمع اكثر.`,
            gift6Part2RelockedPushSubject: 'شجره الفلوس محتاجه مياه',
            gift6Part2RelockedPushBody: (earnedSoFar) => `هداياك لاصدقائك جمعوا لك ${earnedSoFar} جنيه حتى الآن! لتستمر في الربح، ابدأ اعلان لبيع اي سلعة على مزادات الآن.`,
            giftExpirySubject: 'هديتك موجودة بس قربت تنتهي⌛😲',
            giftExpiryBody: (giftNumber, date) => `بنفكرك إن هديتك #${giftNumber} على مزادات قربت تنتهي وتقدر تستخدمه دلوقتي ولحد يوم ${date}`,
        },
        voucher: {
            reissuedPushTitle: 'خصمك الجديد جاهز',
            reissuedPushBody: (code, value, percentage, expiryDate) => `خصمك الجديد بقيمة ${value ? `${value} جنيه مصري` : `${percentage}%`} جاهز للاستعمال بالكود الاتي "${code}" قبل ${expiryDate}.`,
            reissuedMailSubject: 'خصمك الجديد جاهز',
            reissuedMailBody: (username, code, value, percentage, expiryDate) => `عميلنا العزيز ${username}،\n\nخصمك الجديد بقيمة ${value ? `${value} جنيه مصري` : `${percentage}%`} جاهز للاستعمال بالكود الاتي قبل ${expiryDate}.\n\nالكود: ${code}\n\nسعداء بخدمتك،\nفريق مزادات`,
        },
        dayDeal: {
            dayDealStartPushSubject: 'عرض واحد ليوم واحد',
            dayDealStartPushBody: (postTitle) => `افضل سعر في السوق على "${postTitle}"`,
        },
        item: {
            earlyDropOffPushTitle: 'تم تسليم سلع مبكرًا',
            earlyDropOffPushBody: (postId, numberOfItems) => {
                let items;
                if (numberOfItems === 1) items = 'سلعة واحدة';
                else if (numberOfItems === 2) items = 'سلعتين';
                else if (numberOfItems <= 10) items = `${numberOfItems} سلع`;
                else items = `${numberOfItems} سلعة`;
                return `لقد سلّمت ${items} مبكرًا للمنشور #${postId}.`;
            },
            pickUpEarlyDropOffPushTitle: 'تم استلام سلع',
            pickUpEarlyDropOffPushBody: (postId, numberOfItems) => {
                let items;
                if (numberOfItems === 1) items = 'سلعة واحدة';
                else if (numberOfItems === 2) items = 'سلعتين';
                else if (numberOfItems <= 10) items = `${numberOfItems} سلع`;
                else items = `${numberOfItems} سلعة`;
                return `لقد استلمت ${items} للمنشور #${postId}.`;
            },
            cancelledAppointmentPushTitle: 'موعد ملغي',
            cancelledAppointmentPushBody: (postTitle, action) => `لقد تم إلغاء موعدك ل${action === 'pickUp' ? 'استلام' : 'تسليم'} سلع منشورك بعنوان ${postTitle}`,
            cancelledAppointmentMailSubject: 'موعد ملغي',
            cancelledAppointmentMailBody: (userName, date, time, postTitle, action, orderCreated) => `عميلنا العزيز ${userName}،\n\nلقد تم إلغاء موعدك يوم ${date}الساعة${time} ل${action === 'pickUp' ? 'استلام' : 'تسليم'} سلع منشورك بعنوان'${postTitle}' و ذلك لان قد ${orderCreated ? 'تم إنشاء طلب على سلع منشورك' : 'منشورك لم يعد متاحًا'}.\n\nاطيب التمنيات،\nمزادات`,
        },
        unsecuredOrder: {
            orderCreatedSubject: 'تم إنشاء الطلب بنجاح',
            orderCreatedPushBodyBuyer: (orderId, isAuction, postTitle) => `${isAuction ? `مبروك! لقد ربحت المزاد بعنوان "${postTitle}". ` : ''}تم إنشاء الطلب #${orderId} بنجاح. سيتصل بك البائع قريبًا لإتمام عملية الشراء.`,
            orderCreatedPushBodySeller: 'ادفع العمولة المطلوبة للكشف عن معلومات المشتري.',
            orderCreatedMailBodyBuyer: (username, orderId, orderlink, isAuction, postTitle) => `عميلنا العزيز ${username}،\n\n${isAuction ? `مبروك! لقد ربحت المزاد بعنوان "${postTitle}". ` : ''}لقد تم إنشاء الطلب #${orderId.toString().link(orderlink)}. سوف نشارك تفاصيل الاتصال الخاصة بك مع البائع بمجرد أن يدفع البائع الرسوم المطلوبة.\n\nمع أطيب التحيات،\nفريق مزادات`,
            orderCreatedMailBodySeller: (username, orderId, orderlink, postTitle, date, time) => `عزيزي ${username}،\n\nتم إنشاء طلب #${orderId.toString().link(orderlink)} على منشورك "${postTitle}". للكشف عن تفاصيل الاتصال بالمشتري وإتمام عملية الشراء، يُرجى دفع الرسوم المطلوبة قبل الساعة ${time} من يوم ${date}.\n\nمع أطيب التحيات،\nفريق مزادات`,

            orderCancelledByBuyerSubject: 'تم إلغاء الطلب!',
            orderCancelledByBuyerPushBodyBuyer: (orderId) => `تم إلغاء الطلب #${orderId} بنجاح.`,
            orderCancelledBySellerPushBodyBuyer: (orderId) => `تم الغاء طلب بيع #${orderId} عن طريق البائع.`,
            orderCancelledByBuyerPushBodySeller: (orderId) => `لقد ألغى المشتري الطلب #${orderId}.`,
            orderCancelledByBuyerMailBodyBuyer: (username, orderId, orderlink) => `عزيزي ${username}،\n\nتم إلغاء طلبك #${orderId.toString().link(orderlink)} بنجاح.\n\nمع أطيب التحيات.\nفريق مزادات`,
            orderCancelledBySellerMailBodyBuyer: (username, orderId, orderlink) => `عزيزي ${username}،\n\nلقد ألغى البائع طلبك #${orderId.toString().link(orderlink)}.\n\nمع أطيب التحيات،\nفريق مزادات`,
            orderCancelledByBuyerMailBodySeller: (username, orderId, orderlink) => `عزيزي ${username}،\n\nلقد ألغى المشتري الطلب #${orderId.toString().link(orderlink)}.\n\nمع أطيب التحيات،\nفريق مزادات`,

            paymentReminderSubject: 'تذكير بالدفع',
            paymentReminderPushBody: (orderId) => `تذكّر دفع رسوم الطلب #${orderId} للكشف عن تفاصيل الاتصال بالمشتري`,
            paymentReminderMailBody: (username, fees, date, time, orderId, orderlink) => {
                let value = 'الرسوم المطلوبة';
                if (fees > 0) {
                    if (fees > 10) {
                        value = `${fees} جنيهًا مصريًّا`;
                    } else {
                        value = `${fees} جنيهات مصرية`;
                    }
                }
                return `عزيزي ${username}،\n\nتذكّر دفع ${value} للطلب #${orderId.toString().link(orderlink)} قبل الساعة ${time} من يوم ${date} للكشف عن معلومات الاتصال بالمشتري.\n\nمع أطيب التحيات\nفريق مزادات`;
            },

            sellerPaymentPushSubjectBuyer: 'خطوة أقرب',
            sellerPaymentMailSubjectBuyer: 'تحديث لطلب',
            sellerPaymentPushSubjectSeller: 'تم دفع الرسوم بنجاح',
            sellerPaymentMailSubjectSeller: 'تأكيد دفع الرسوم',
            sellerPaymentPushBodyBuyer: (orderId) => `لدى بائع الطلب #${orderId} الآن تفاصيل الاتصال بك وسيتواصل معك قريبًا لإكمال عملية الشراء`,
            sellerPaymentPushBodySeller: (orderId) => `لقد تم دفع رسوم الطلب #${orderId} بنجاح، يمكنك الآن الكشف عن معلومات المشتري من خلال صفحة الطلبات`,
            sellerPaymentMailBodyBuyer: (username, orderId, orderlink) => `عزيزي ${username}،\n\nلدى بائع الطلب #${orderId.toString().link(orderlink)} الآن تفاصيل الاتصال بك وسيتواصل معك قريبًا لإكمال عملية الشراء.\n\nمع أطيب التحيات،\nفريق مزادات`,
            sellerPaymentMailBodySeller: (username, fees, orderId, orderlink) => `عزيزي ${username}،\n\nلقد تم دفع ${fees} ${fees > 10 ? 'جنيهًا مصريًّا' : 'جنيهات مصرية'} للطلب #${orderId.toString().link(orderlink)}. يمكنك الآن رؤية بيانات اتصال المشتري من صفحة الطلبات.\n\nمع أطيب التحيات\nفريق مزادات`,

            sellerDidnotPaySubject: 'تم إلغاء الطلب!',
            sellerDidnotPayPushBodyBuyer: (orderId) => `لقد تم إلغاء الطلب #${orderId} لأن البائع فاته موعد دفع الرسوم.`,
            sellerDidnotPayPushBodySeller: (orderId) => `لقد فاتك الموعد النهائي لدفع رسوم الطلب #${orderId} وتم إلغاء الطلب.`,
            sellerDidnotPayMailBodyBuyer: (username, orderId, orderlink) => `عزيزي ${username}،\n\nللأسف تم إلغاء الطلب #${orderId.toString().link(orderlink)} لأن البائع فاته موعد دفع الرسوم.\n\nمع أطيب التحيات\nفريق مزادات`,
            sellerDidnotPayMailBodySeller: (username, orderId, orderlink) => `عزيزي ${username}،\n\nلقد فاتك الموعد النهائي لدفع رسوم الطلب #${orderId.toString().link(orderlink)}، ونتيجة لذلك، تم إلغاء الطلب.\n\nمع أطيب التحيات\nفريق مزادات`,

            buyerInformationSubject: 'تفاصيل الاتصال بالمشتري',
            buyerInformationMailBody: (username, orderId, buyername, buyerphone, orderlink) => `عزيزي ${username}،\n\nبخصوص الطلب #${orderId.toString().link(orderlink)}، فيما يلي تفاصيل الاتصال بالمشتري:\n\n  الاسم: ${buyername}\n  رقم الهاتف: ${buyerphone}\n\nبرجاء إعلامنا عند إجراء الاتصال لإكمال الطلب.\n\nمع أطيب التحيات\nفريق مزادات`,

            orderCompletedPushSubject: 'تم اكتمال الطلب!',
            orderCompletedPushBody: (orderId) => `تم إكمال الطلب #${orderId} بنجاح.`,
        },
        wallet: {
            walletChargedPushSubject: 'تم شحن محفظة مزادات',
            walletChargedPushBody: (amount) => `لقد تم شحن محفظة مزادات بـ${amount} ج.م`,
        },
        transaction: {
            transactionPushTitle: (type) => `${type === 'هدية المنشور' ? 'مبروك!' : `اكتملت معاملة ${type} `}`,
            transactionPushBody: (type, amount) => `${type === 'هدية المنشور' ? `تم إضافة ${Math.abs(amount)} جنية مكافأة في المحفظة الخاصة بكم للتسوق في مزادات` : ` اكتملت معاملة ${type} وتم ${amount >= 0 ? 'إضافة' : 'خصم'} مبلغ ${Math.abs(amount)}  ${amount >= 0 ? 'الى حسابك ' : 'من حسابك'}`}`,
            transactionSmsBody: (type, amount) => `${type === 'هدية المنشور' ? `تم إضافة ${Math.abs(amount)} جنية مكافأة في المحفظة الخاصة بكم للتسوق في مزادات` : ` اكتملت معاملة ${type} وتم ${amount >= 0 ? 'إضافة' : 'خصم'} مبلغ ${Math.abs(amount)}  ${amount >= 0 ? 'الى حسابك ' : 'من حسابك'}`}`,
        },
        checkout: {
            completeCheckoutSubject: 'إتمام عملية الشراء',
            completeCheckoutBuyNowBody: 'يرجى إكمال عملية الشراء',
            completeCheckoutAuctionBody: 'تهانينا، لقد فزت بالمزاد الخاص بك، يرجى إكمال عملية الشراء',
        },
        action: {
            pendingActionsTitle: 'إجراءات تتطلب انتباهك',
            pendingActionsPushBody: 'لديك إجراءات تتطلب انتباهك، يرجى إلقاء نظرة لمواصلة الاستمتاع بتجربة مميزة على مزادات',
            pendingActionsSmsBody: (username, link) => `عميلنا العزيز ${username},\nلديك إجراءات تتطلب انتباهك، يرجى إلقاء نظرة عليها ${(link)}`,

        },
        penalty: {
            penaltyAppliedPushSubject: 'غرامة مستحقة',
            penaltyAppliedPushBody: (amount) => `لقد تم تطبيق غرامة عليك بمبلغ ${amount} جنيهًا وسيتم خصمها من حساب المحفظة.`,
            penaltyAppliedMailSubject: 'تنويه: غرامة مستحقة',
            penaltyAppliedMailBody: (username, reason, objectId, link, amount) => {
                let penaltyReason;
                switch (reason) {
                    case 'BuyerDidNotShow':
                        penaltyReason = 'لم تحضر لاستلام طلب';
                        break;
                    case 'SellerDidNotDropOff':
                        penaltyReason = 'لم تقم بتسليم قطع طلب';
                        break;
                    case 'SellerDidNotPayCommission':
                        penaltyReason = 'لم تدفع الرسوم المطلوبة لكشف معلومات مشتري طلب';
                        break;
                    default:
                        penaltyReason = 'لم تتبع التعليمات المطلوبة لاكمال طلب';
                }

                return `عميلنا العزيز ${username}،\n\n لقد تم تطبيق غرامة عليك وقد تم خصم مبلغ ${amount} جنيهًا من حسابك و ذلك لأنك ${penaltyReason} #${objectId.toString().link(link)}.\n\nمع أطيب التحيات\nفريق مزادات`;
            },
            penaltyResetPushSubject: 'إلغاء الغرامة',
            penaltyResetPushBody: 'تم إلغاء الغرامة المفروضة عليك',
        },
        multiSP: {
            postItemsReadyTitle: 'استلام قطع المنشور',
            postItemsReadyBody: (postId, spName) => `قطع منشور #${postId} متاحة الآن للاستلام من مركز خدمة ${spName}.`,
        },
        reminders: {
            approvedPostReminder: (postData = 'منشوراتك') => `لمعرفة اخر الاخبار عن ${postData}، قم بفتح الاشعارات`,
            completedPurchases: 'لمتابعة طلبياتك في اسرع وقت، قم بفتح اشعارات الطلبيات',
            startedBiddings: 'مزادات تفضل ان تقوم بفتح اشعارتك لتكون جهاز دائما لتقديم مزايدتك',
        },
        chat: {
            messageSentTitle: 'لديك رسالة في إنتظارك',
            generalChatBody: (username) => `أرسل ${username} لك رسالة جديدة`,
            textBody: (username, message) => `أرسل ${username} لك رسالة جديدة: ${message}`,
            voiceBody: (username) => `أرسل ${username} لك رسالة صوتية جديدة 🎙️`,
            imageBody: (username) => `أرسل ${username} لك صورة جديدة 📷`,
            videoBody: (username) => `أرسل ${username} لك فيديو جديد 🎥`,
            fileBody: (username) => `أرسل ${username} لك ملف جديد 🗃️`,
        },
        valet: {
            subject: 'طلب جديد من خدمة مزادات المميزة',
            body: (user, address) => `لديك طلب جديد من خدمة مزادات المميزة للمستخدم ${user.username}\n  رقم العميل ${user.phone.number}  
            \n العنوان: \n شارع ${address.street} \n منطقة  ${address.area.name.ar} مبني  ${address.building} \n شقة  ${address.apartment} \n محافظة ${address.area.city.name.ar}`,
        },
        pickPackAndShip: {
            subject: 'طلب تغليف وتوصيل جديد',
            body: (user, address) => `لديك طلب تغليف وتوصيل جديد ${user.username}\n  رقم العميل ${user.phone.number}  
            \n العنوان: \n شارع ${address.street} \n منطقة  ${address.area.name.ar} مبني  ${address.building} \n شقة  ${address.apartment} \n محافظة ${address.area.city.name.ar}`,
        },
    },
};

export default messages;

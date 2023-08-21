const environment = process.env.NODE_ENV || 'development';
const topics = {
    // [mh] 06/10/2021 NOTE: Old types should be removed after mobile first force update
    // Mobile feature: Notify me button in upcoming day deals and special posts
    // This file should be synced with the src\utilities\topics.js file in MobileX
    // Implementation found in \src\components\dummy.components\dayDeal\upcomingView.js in MobileX
    types: {
        general: `${environment}-General`,
        promotionalPost: `${environment}-Promotional-Post`,
        dayDeal: `${environment}-Day-Deal`,
    },
    general: {
        all: `${environment}-General`,
        en: `${environment}-General-en`,
        ar: `${environment}-General-ar`,
    },
    generalAnonymous: {
        all: `${environment}-General-Anonymous`,
        en: `${environment}-General-Anonymous-en`,
        ar: `${environment}-General-Anonymous-ar`,
    },
    promotionalPost: {
        starting: {
            all: `${environment}-Promotional-Post-Starting`,
            en: `${environment}-Promotional-Post-Starting-en`,
            ar: `${environment}-Promotional-Post-Starting-ar`,
        },
    },
    dayDeal: {
        starting: {
            all: `${environment}-Day-Deal-Starting`,
            en: `${environment}-Day-Deal-Starting-en`,
            ar: `${environment}-Day-Deal-Starting-ar`,
        },
    },
    backoffice: {
        notifyActionNeeded: {
            notifyPostReview: {
                en: `${environment}-Notify-Post-Review-en`,
                ar: `${environment}-Notify-Post-Review-ar`,
            },
            notifyNewReview: {
                en: `${environment}-Notify-New-Review-en`,
                ar: `${environment}-Notify-New-Review-ar`,
            },
            notifyNewQuestion: {
                en: `${environment}-Notify-New-Question-en`,
                ar: `${environment}-Notify-New-Question-ar`,
            },
            notifyNewAnswer: {
                en: `${environment}-Notify-New-Answer-en`,
                ar: `${environment}-Notify-New-Answer-ar`,
            },
            notifyNewComment: {
                en: `${environment}-Notify-New-Comment-en`,
                ar: `${environment}-Notify-New-Comment-ar`,
            },
            notifyNewReturnRequest: {
                en: `${environment}-Notify-New-Return-Request-en`,
                ar: `${environment}-Notify-New-Return-Request-ar`,
            },
            notifyReturnRequestReview: {
                en: `${environment}-Notify-Return-Request-Review-en`,
                ar: `${environment}-Notify-Return-Request-Review-ar`,
            },
            notifyNewContactUsForm: {
                en: `${environment}-Notify-New-Contact-Us-Form-en`,
                ar: `${environment}-Notify-New-Contact-Us-Form-ar`,
            },
            notifyNewTicket: {
                en: `${environment}-Notify-New-Ticket-en`,
                ar: `${environment}-Notify-New-Ticket-ar`,
            },
            notifyNewInvitationRequest: {
                en: `${environment}-Notify-New-Invitation-Request-en`,
                ar: `${environment}-Notify-New-Invitation-Request-ar`,
            },
            notifyShareableLinkExtensionRequest: {
                en: `${environment}-Notify-Shareable-Link-Extension-Request-en`,
                ar: `${environment}-Notify-Shareable-Link-Extension-Request-ar`,
            },
            notifyAppendDataRequest: {
                en: `${environment}-Notify-Append-Data-Request-en`,
                ar: `${environment}-Notify-Append-Data-Request-ar`,
            },
        },
    },
};

export default topics;

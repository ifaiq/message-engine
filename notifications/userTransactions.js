/**
* UserTransactions Notifications
* @module
*/

import winston from 'winston';
import messages from '../i18n/i18n.js';
import isEmpty from '../misc/isEmpty.js';
import sendNotifications from '../misc/notifications.js';
import User from '../models/user.js';

//----------------------------------------------------------------------------------

const mapType = (type) => {
    let arabicType;
    switch (type) {
        case 'Delivery Fees':
            arabicType = 'مصاريف توصيل';
            break;
        case 'Purchase':
            arabicType = 'شراء';
            break;
        case 'Revenue':
            arabicType = 'عائد';
            break;
        case 'Fees':
            arabicType = 'مصاريف';
            break;
        case 'Rejection':
            arabicType = 'مرفوض';
            break;
        case 'Voucher':
            arabicType = 'قسيمة الشراء';
            break;
        case 'Deposit':
            arabicType = 'إيداع';
            break;
        case 'Invitation Gift':
            arabicType = 'هدية دعوة';
            break;
        case 'Withdrawal':
            arabicType = 'سحب';
            break;
        case 'Boost':
            arabicType = 'عرض';
            break;
        case 'Premium':
            arabicType = 'مزاد ممتاز';
            break;
        case 'StorageFees':
            arabicType = 'مصاريف تخزين';
            break;
        case 'Return':
            arabicType = 'إرجاع';
            break;
        case 'Promotion':
            arabicType = 'عرض تسويق';
            break;
        case 'Post Gift':
            arabicType = 'هدية المنشور';
            break;
        default:
            break;
    }
    return arabicType;
};
//----------------------------------------------------------------------------------

async function notifyTransactionCompleted(userId, type, amount, transactionId) {
    try {
        const user = await User.findById(userId).lean();
        if (isEmpty(user)) {
            const error = new Error(`User with ID ${userId} is not found`);
            winston.error(error);
            return { sent: false, err: error };
        }
        if (amount === 0) {
            winston.warn(`Transaction <${transactionId}> has zero amount.`);
            return { sent: true };
        }
        const fixedAmount = Number(amount.toFixed(2));
        let mappedType = type;
        // since the mapping is for arabic only not like the rest of the projects
        // The type in the models is DeliveryFees, yet the filter takes Delivery Fees
        if (mappedType === 'DeliveryFees') mappedType = 'Delivery Fees';
        if (user.language === 'ar') mappedType = mapType(type);
        const pushTitle = messages[user.language].transaction.transactionPushTitle(mappedType);
        const pushBody = messages[user.language].transaction.transactionPushBody(mappedType, fixedAmount);
        const smsBody = messages[user.language].transaction.transactionSmsBody(mappedType, fixedAmount);
        const payloadObj = {
            read: false,
            user: userId,
            type: 'transaction',
            transaction: {
                focusType: mappedType,
                focusId: transactionId,
            },
        };
        const notificationMeans = { isPush: true, isSMS: true };
        const params = {
            push: {
                messages: [{ title: pushTitle, body: pushBody }],
                payloads: [payloadObj],
            },
            sms: {
                message: smsBody,
                service: 'primary',
            },
        };
        return await sendNotifications(notificationMeans, params, [userId], 'Receipts');
    } catch (error) {
        return { sent: false, err: error };
    }
}

export default notifyTransactionCompleted;

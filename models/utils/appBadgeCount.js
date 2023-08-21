import Notification, { notificationLimit } from '../notification.js';

async function getAppBadgeCount(userId) {
    if (!userId) return undefined;
    const matchQuery1 = { user: userId };
    const sortQuery = { createdAt: -1 };
    const matchQuery2 = { appBadgeRead: false };

    const aggregateQuery = [
        { $match: matchQuery1 },
        { $sort: sortQuery },
        { $limit: notificationLimit }, // we subtract 1 to take into account the notification being sent that has not yet been saved
        { $match: matchQuery2 },
        { $project: { id: 1 } },
    ];

    const notifications = await Notification.aggregate(aggregateQuery);
    // we add 1 to take into account the notification being sent that has not yet been saved
    return notifications.length + 1;
}

// TODO Taimir Not used ?
export default getAppBadgeCount;

/**
* General Notifications
* @module
*/

import { pushNotificationToTopic } from '../misc/mobileNotifications.js';

async function pushToTopic(message, payload, topic) {
    const isNotificationSent = await pushNotificationToTopic(message, payload, topic);
    return isNotificationSent;
}

export default pushToTopic;

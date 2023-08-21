/**
 * Set the Icon path of each Action.
 * @module
 */

import { auctionCheckoutTitleEn, storagePath } from './config.js';

/**
 * Set the path of action according to the type and action type
 * @param {'order' | 'appointment' | 'appointment-coming' | 'shoppingCart' | 'post'| 'userProfile' | 'commission' | 'transaction'}  type type of action
 * @param {'pickUp' | 'dropOff' | 'reviewOrder'} actionType actionType of the action
 * @param {String} title auction checkout action title
 * @returns iconPath
 */
const setActionIcon = (type, actionType, title) => {
    let actionIcon = '';
    if (type === 'order') {
        if (actionType === 'pickUp') actionIcon = title === auctionCheckoutTitleEn ? 'checkout.png' : 'pickUp.png';
        if (actionType === 'dropOff') actionIcon = 'dropOff.png';
        if (actionType === 'reviewOrder') actionIcon = 'review.png';
    }
    if (type === 'appointment' || type === 'appointment-coming') actionIcon = 'bookAppointment.png';
    if (type === 'shoppingCart') actionIcon = 'checkout.png';
    if (type === 'post' && actionType === 'pickUp') actionIcon = 'pickUp.png';
    if (type === 'userProfile') actionIcon = 'completeYourData.png';
    if (type === 'transaction' || type === 'commission') actionIcon = 'fees.png';

    const iconPath = `${storagePath}action-icons/${actionIcon}`;
    return iconPath;
};
export default setActionIcon;

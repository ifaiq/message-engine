/**
 * Credit Card Amount model
 * @description Holds the amount of credit card deposits
 *              and withdrawals for a user; in order to be
 *              checked before withdrawing from the user's
 *              wallet.
 * @module creditCardAmount
 */

import mongoose from 'mongoose';

const creditCardAmountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    depositAmount: {
        type: Number,
        default: 0,
    },
    withdrawalAmount: {
        type: Number,
        default: 0,
    },
});

//---------------------------------------------------------------------------------
const creditCardAmount = mongoose.model('CreditCardAmount', creditCardAmountSchema);

export default creditCardAmount;

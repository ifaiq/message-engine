/**
 * Post Gift Schema Used to set / Change value of gift
 * enabled option true / false
 */

import mongoose from 'mongoose';

const platformGiftSchema = new mongoose.Schema({
    value: {
        type: Number,
        default: 50,
        required: true,
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true,
    },
    postMinimumPrice: {
        type: Number,
        default: 1000,
        required: true,
    },
});
//---------------------------------------------------------------------------------
const PlatformGift = mongoose.model('PlatformGift', platformGiftSchema);

export default PlatformGift;

import config from 'config';
import mongoose from 'mongoose';
import moment from 'moment';
import randToken from 'rand-token';
import Gift from '../gift.js';
import Voucher from '../voucher.js';

const numberOfGifts = config.get('gifts.numberOfUserGifts');
const mazadatUser = config.get('mazadatFirstUserID');
const gift6Value = config.get('gifts.gift6PrimaryValue');
const gift6Minimum = config.get('gifts.gift6PrimaryMinimumPrice');
const gift6Expiry = config.get('gifts.gift6ExpiryInDays');
const gift6MaxUses = config.get('gifts.gift6MaxUsesBeforeBlock');
const gift2Percentage = config.get('gifts.gift2Percentage');
const gift4Percentage = config.get('gifts.gift4Percentage');
const gift5Value = config.get('gifts.gift5Value');
const gift5Minimum = config.get('gifts.gift5MinimumPrice');

//---------------------------------------------------------------------------------
async function createVoucher(giftNumber, userId) {
    let voucher;
    let secondaryVoucher;
    let startDate; let endDate;
    switch (giftNumber) {
        case 2:
            voucher = new Voucher({
                code: randToken.uid(8),
                type: 'percentage',
                percentage: gift2Percentage,
                issuer: mongoose.Types.ObjectId(mazadatUser),
                issuedFor: userId,
            });
            break;
        case 4:
            voucher = new Voucher({
                code: randToken.uid(8),
                type: 'percentage',
                percentage: gift4Percentage,
                issuer: mongoose.Types.ObjectId(mazadatUser),
                issuedFor: userId,
            });
            break;
        case 5:
            voucher = new Voucher({
                code: randToken.uid(8),
                type: 'value',
                value: gift5Value,
                minimumPrice: gift5Minimum,
                issuer: mongoose.Types.ObjectId(mazadatUser),
                issuedFor: userId,
                toBeUsedBy: 'EverybodyButPerson',
            });

            secondaryVoucher = new Voucher({
                code: randToken.uid(8),
                type: voucher.type,
                value: voucher.value,
                percentage: voucher.percentage,
                minimumPrice: voucher.minimumPrice,
                issuer: voucher.issuer,
                issuedFor: voucher.issuedFor,
            });
            break;
        case 6:
            startDate = moment();
            endDate = moment().add(gift6Expiry, 'days');
            voucher = new Voucher({
                code: randToken.uid(8),
                status: 'active',
                type: 'value',
                value: gift6Value,
                minimumPrice: gift6Minimum,
                issuer: mongoose.Types.ObjectId(mazadatUser),
                issuedFor: userId,
                toBeUsedBy: 'EverybodyButPerson',
                maxNumberOfUses: gift6MaxUses,
                startDate: startDate.toISOString(),
                expiryDate: endDate.toISOString(),
            });
            break;
        default:
            break;
    }
    if (voucher) await voucher.save();
    if (secondaryVoucher) await secondaryVoucher.save();
    return { voucherId: voucher ? voucher._id : undefined, secondaryVoucherId: secondaryVoucher ? secondaryVoucher._id : undefined };
}

async function createUserGifts(userId) {
    const gifts = [];
    for (let i = 0; i < numberOfGifts; i += 1) {
        const giftNumber = i + 1;
        const gift = { user: userId, giftNumber };
        const { voucherId, secondaryVoucherId } = await createVoucher(giftNumber, userId);
        if (giftNumber === 6 || giftNumber === 2 || giftNumber === 4) gift.personalVoucher = voucherId;
        if (giftNumber === 5) {
            gift.giftVoucher = voucherId;
            gift.personalVoucher = secondaryVoucherId;
        }
        if (giftNumber === 6) {
            gift.status = 'unlocked';
            gift.expiryDate = moment().add(gift6Expiry, 'days').toISOString();
        }
        gifts.push(gift);
    }
    await Gift.insertMany(gifts);
}

export default createUserGifts;

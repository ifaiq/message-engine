import mongoose from 'mongoose';
import config from 'config';

const CharginItemsAtSPSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Item' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    freePeriodRemainingDays: {
        type: Number, min: 0, max: config.get('freePeriodRemainingDays'), default: config.get('freePeriodRemainingDays'),
    }, // default values not set yet

});
CharginItemsAtSPSchema.set('timestamps', true);

const CharginItemsAtSP = mongoose.model('CharginItemsAtSP', CharginItemsAtSPSchema);

// TODO Taimir not used
export default CharginItemsAtSP;

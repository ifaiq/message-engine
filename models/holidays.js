import mongoose from 'mongoose';

const holidaysSchema = new mongoose.Schema({
    // public holidays
    daysOff: {
        type: [Date],
    },
    // frequent holidays
    SPDaysOff: {
        type: [String],
    },

});

const Holidays = mongoose.model('Holidays', holidaysSchema);

export default Holidays;

import mongoose from 'mongoose';

const systemAnalyticsSchema = new mongoose.Schema({
    logins: [{
        date: {
            type: Date,
        },
        numberOfLogins: {
            type: Number,
            default: 0,
        },
    }],
});

const SystemAnalytics = mongoose.model('SystemAnalytics', systemAnalyticsSchema);

export default SystemAnalytics;

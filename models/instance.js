import mongoose from 'mongoose';

const instanceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true,
    },
    currentInstanceId: {
        instanceId: {
            type: String,
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
    },
    instancesHistory: [
        {
            instanceId: {
                type: String,
                index: true,
            },
            createdAt: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
});

const Instance = mongoose.model('Instance', instanceSchema);

export default Instance;

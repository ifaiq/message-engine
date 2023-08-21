import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['mobileAppIOS', 'mobileAppAndroid', 'backofficeApp'],
            required: true,
            unique: true,
        },
        version: {
            type: String,
            required: true,
        },
        minimumAllowedVersion: { // latest force update version
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

const Version = mongoose.model('version', versionSchema);

export default Version;

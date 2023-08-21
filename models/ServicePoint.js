import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema({
    dayOff: {
        type: Boolean,
        required: true,
    },
    slots: [
        {
            from: {
                type: String,
                required() {
                    return !this.dayOff;
                },
                validator: function isTimeValid(v) {
                    return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: (props) => `${props.value} is not a valid 24-hour format.`,
            },
            window: {
                type: Number,
            },
        },
    ],
});

const name = {
    type: String,
    required: true,
};

const address = {
    apartment: {
        type: Number,
        min: 1,
    },
    floor: {
        type: Number,
    },
    building: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
};

const servicePointSchema = new mongoose.Schema(
    {
        /** this is done this way out of the convention of ar: en: inside the
         * object to ensure backwards compatibility, and internally with each
         * API call we  can replace the name and the address depending on the
         * language or send the whole data and the client handles the localization.
         */
        ar: {
            name,
            address,
        },
        name,
        address,
        image: {
            type: String,
        },
        location: {
            lat: {
                type: String,
            },
            lon: {
                type: String,
            },
        },
        workingHours: [
            workingHoursSchema,
        ],
        area: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Area',
            required: true,
        },
        phone: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

const ServicePoint = mongoose.model('ServicePoint', servicePointSchema);

export default ServicePoint;

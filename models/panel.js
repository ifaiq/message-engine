import mongoose from 'mongoose';

function validImages(v) {
    return v.length > 0;
}
const panelSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category',
    },
    images: {
        type: [String],
        validate: [validImages, 'Please add at least one image'],
    },
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    from: {
        type: Date,
        required: true,
    },
    to: {
        type: Date,
        required: true,
    },
    periorty: {
        type: Number,
        enum: [1, 2, 3],
        default: 1,

    },
}, { timestamps: true });

const Panel = mongoose.model('Panel', panelSchema);

export default Panel;

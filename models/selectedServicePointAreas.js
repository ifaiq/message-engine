import mongoose from 'mongoose';

const selectedServicePointAreas = new mongoose.Schema({
    area: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
});

const SelectedServicePointAreas = mongoose.model('SelectedServicePointAreas', selectedServicePointAreas);

export default SelectedServicePointAreas;

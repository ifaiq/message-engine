import mongoose from 'mongoose';

const appendPostDataSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        index: true,
    },
    description: {
        type: String,
        minlength: 5,
        maxlength: 5000,
    },
    images: {
        type: [String],
    },
}, { timestamps: true });

const AppendPostData = mongoose.model('AppendPostData', appendPostDataSchema);

export default AppendPostData;

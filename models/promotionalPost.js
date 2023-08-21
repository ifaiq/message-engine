import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        esId: {
            // This is an id that is specifically done to be indexed in elasticSearch
            type: Number,
            es_indexed: true,
            es_type: 'keyword',
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PromotionalAuction',
        },
        title: {
            english: {
                type: String,
                minlength: 5,
                maxlength: 255,
            },
            arabic: {
                type: String,
                minlength: 5,
                maxlength: 255,
            },
        },
        images: {
            type: [String],
        },
        thumbnail: {
            type: String,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            },
        ],
        language: {
            type: String,
            enum: ['English', 'Arabic', 'Both'],
        },
        status: {
            type: String,
            required: true,
            enum: [
                'waitingStartDate',
                'available',
                'waitingPickUp',
                'sold',
                'cancelledForError',
                'expired',
            ],
        },
        english: {
            description: {
                type: String,
                maxlength: 5000,
                required() {
                    return (
                        this.language === 'English' || this.language === 'Both'
                    );
                },
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
                required() {
                    return (
                        this.language === 'English' || this.language === 'Both'
                    );
                },
            },
        },
        arabic: {
            description: {
                type: String,
                maxlength: 5000,
                required() {
                    return (
                        this.language === 'Arabic' || this.language === 'Both'
                    );
                },
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
                required() {
                    return (
                        this.language === 'Arabic' || this.language === 'Both'
                    );
                },
            },
        },
        winner: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            SP: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ServicePoint',
            },
            timeslot: { type: Date },
        },
        views: [{
            date: {
                type: Date,
            },
            numberOfViews: {
                type: Number,
                default: 0,
            },
        }],
        totalViewsCounter: {
            type: Number,
            min: 0,
            default: 0,
        },
        startDate: {
            type: Date,
            required: true,
        },
        sellerPostType: {
            type: String,
            enum: [
                'DropOff',
            ],
            required: true,
            default: 'DropOff',
        },
        SP: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServicePoint',
        },
        postArea: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Area',
        },
    },
    { timestamps: true },
);

postSchema.pre('save', function run(next) {
    if (this.isNew) {
        const stringId = this._id.toString().slice(-5);
        const id = parseInt(stringId, 16) % 1e6;
        this.esId = id;
    }
    return next();
});

postSchema.index({ '$**': 'text' }, { default_language: 'en', language_override: 'en' });
// 'default_language': 'en',
//  'language_override': 'en'

const PromotionalPost = mongoose.model('PromotionalPost', postSchema);

export default PromotionalPost;

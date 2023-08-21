import mongoose from 'mongoose';

const SeederMigrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const SeederMigration = mongoose.model('SeederMigration', SeederMigrationSchema);

export default SeederMigration;

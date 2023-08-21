import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminRoles = ['admin', 'superAdmin', 'customerSupport', 'servicePointAgent'];
const deleted = [true, false];
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true,
    },
    email: {
        type: String,
        minlength: 5,
        maxlength: 255,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 1024,
        required: true,
    },
    role: {
        type: String,
        enum: adminRoles,
        default: 'superAdmin',
    },
    phone: {
        code: {
            type: String,
            minlength: 2,
            maxlength: 2,
        },
        number: {
            type: String,
            validate: {
                validator: function isValid(v) {
                    return /^01[0-2|5]{1}[0-9]{8}$/.test(v);
                },
                message: function getmessage(props) {
                    return `${props.value} is not a valid phone number!`;
                },
            },
        },
    },
    SP: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicePoint',
    },
    deleted: {
        type: Boolean,
        enum: deleted,
        default: false,

    },
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en',
        required: true,
    },
    passwordConfirmation: {
        type: mongoose.Schema.Types.ObjectId,
    },
}, { timestamps: true });

adminSchema.methods.validPassword = async function verifyPassword(password) {
    const res = await bcrypt.compare(password, this.password);
    return res;
};

// change the password confirmation on changing the password
adminSchema.pre('save', function run(next) {
    if (this.isModified('password') || this.isNew) {
        this.passwordConfirmation = new mongoose.Types.ObjectId();
    }
    next();
});
const Admin = mongoose.model('Admin', adminSchema);

export default Admin;

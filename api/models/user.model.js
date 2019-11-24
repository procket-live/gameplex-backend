const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: String,
    mobile: {
        type: String,
        require: true,
        unique: true,
    },
    is_mobile_verified: { type: Boolean, default: false },
    is_email_verified: { type: Boolean, default: false },
    email: { type: String, unique: true },
    password: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    points: { type: Number, default: 0 },
    firebase_token: String,
    account_source: { type: String, enum: ['Mobile', 'Truecaller'], default: 'Mobile' },
    profile_image: String,
    role: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: true }]
});

module.exports = mongoose.model('User', userSchema);
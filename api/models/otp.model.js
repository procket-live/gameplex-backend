const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    mobile: String,
    email: String,
    otp: String,
    otp_type: { type: String, enum: ['email', 'mobile'], require: true },
    created_at: Date,
    expires_at: Date,
    deleted_at: Date
});

module.exports = mongoose.model('Otp', otpSchema);
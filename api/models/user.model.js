const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    mobile: {
        type: String,
        require: true,
        unique: true,
    },
    email: { type: String, unique: true, require: true },
    gender: String,
    points: { type: Number, default: 0 },
    firebase_token: String,
    account_source: { type: String, enum: ['mobile', 'truecaller'] },
    profile_image: String,
    role: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: true }]
});

module.exports = mongoose.model('User', userSchema);
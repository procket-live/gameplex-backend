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
    dob: { type: Date },
    username: String,
    quickblox_secret: String,
    quickblox_id: String,
    email: { type: String, unique: false, index: false },
    password: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    points: { type: Number, default: 0 },
    firebase_token: String,
    account_source: { type: String, enum: ['Mobile', 'Truecaller'], default: 'Mobile' },
    profile_image: String,
    role: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: true }],
    wallet_cash_balance: { type: Number, default: 0 },
    wallet_bonous_balance: { type: Number, default: 0 },
    wallet_win_balance: { type: Number, default: 0 },
    wallet_transactions: [{
        amount: { type: Number },
        target: { type: String, enum: ['cash_balance', 'bonous_balance', 'win_balance'], require: true },
        source: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
        source_name: String,
        deleted_at: { type: Date, default: null },
        created_at: { type: Date, default: Date.now },
    }],
    game_ids: [{ game: mongoose.Schema.Types.ObjectId, user_id: String }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const bankAccountSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    accont_number: String,
    user_name: String,
    ifsc: String,
    created_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true, unique: true },
    created_at: { type: Date, default: Date.now },
    deleted_at: { type: Date },
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
const mongoose = require('mongoose');

const bankAccountSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User' },
    accont_number: String,
    user_name: String,
    ifsc: String,
    created_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: { type: Date },
    deleted_at: { type: Date },
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
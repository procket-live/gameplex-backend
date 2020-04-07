const mongoose = require('mongoose');

const withdrawalRequestSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    order_id: String,
    status: { type: String, emun: ['pending', 'failed', 'success'], default: 'pending' },
    amount: String,
    success_response: String,
    error_response: String,
    documents: [String],
    target: { type: String, emun: ['bank', 'upi'], default: 'bank' },
    created_by: { type: mongoose.Schema.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null }
});

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    order_id: String,
    status: { type: String, emun: ['pending', 'failed', 'success'], default: 'pending' },
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    amount: String,
    target_ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer', default: null },
    document_links: [{ type: String }],
    response: { type: String },
    created_by: { type: mongoose.Schema.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
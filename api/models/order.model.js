const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    order_id: String,
    status: { type: String, emun: ['pending', 'failed', 'success'], default: 'pending' },
    target_ref: { type: mongoose.Schema.Types.ObjectId },
    target: { type: String, enum: ['User', 'Organizer'] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: String,
    success_response: { type: mongoose.Schema.Types.Mixed },
    generate_response: { type: mongoose.Schema.Types.Mixed },
    created_by: { type: mongoose.Schema.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
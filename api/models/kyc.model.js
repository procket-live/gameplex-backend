const mongoose = require('mongoose');

const kycModel = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pan_number: { type: String },
    name_on_pan: { type: String },
    aadhaar_number: { type: String },
    pan_document_link: { type: String },
    aadhaar_document_link: { type: String },
    status: { type: String, enum: ['pending', 'submit', 'processing', 'verifed', 'rejected'] },
    comments: [{ type: String, created_by: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: Date
});

module.exports = mongoose.model('Kyc', kycModel);
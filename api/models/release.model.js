const mongoose = require('mongoose');

const releaseModel = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: String,
    update_new: [String],
    version: String,
    link: String,
    app_delivery_link: String,
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AppRelease', releaseModel);
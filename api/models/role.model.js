const mongoose = require('mongoose');

const roleModel = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: String,
    description: String,
    created_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleModel);
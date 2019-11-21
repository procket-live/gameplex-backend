const mongoose = require('mongoose');

const roleModel = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    created_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: Date
});

module.exports = mongoose.model('Role', roleModel);
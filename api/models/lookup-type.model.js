const mongoose = require('mongoose');

const lookupTypeSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    description: String,
    values: [{
        name: String,
        description: String,
        value: String,
    }],
    created_at: { type: Date, default: Date.now, auto: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: { type: Date, default: Date.now, auto: true },
});

module.exports = mongoose.model('LookupType', lookupTypeSchema);
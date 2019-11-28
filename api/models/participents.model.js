const mongoose = require('mongoose');

const partifipentModel = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    created_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: Date,
    deleted_at: Date,
});

module.exports = mongoose.model('Participent', partifipentModel);
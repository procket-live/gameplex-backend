const mongoose = require('mongoose');

const instructionStepSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String },
    message: { type: String },
    note: { type: String },
    image: { type: String },
    created_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: Date
});

module.exports = mongoose.model('InstructionStep', instructionStepSchema);
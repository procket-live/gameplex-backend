const mongoose = require('mongoose');

const instructionStepSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String },
    message: { type: String },
    note: { type: String },
    image: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InstructionStep', instructionStepSchema);
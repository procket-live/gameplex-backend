const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    cash_balance: { type: Number, default: 0 },
    bonous_balance: { type: Number, default: 0 },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransactons', require: true }]
});

module.exports = mongoose.model('Wallet', walletSchema);
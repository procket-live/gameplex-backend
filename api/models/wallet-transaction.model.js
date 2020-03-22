const mongoose = require('mongoose');

const walletTransactionSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

});

module.exports = mongoose.model('WalletTransactons', walletTransactionSchema);  
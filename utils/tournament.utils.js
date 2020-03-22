exports.calculateEntryFee = function (prizeMeta = []) {
    const entryFee = prizeMeta.find((item, index) => {
        return item.key == "Entry Fee";
    })

    if (!(entryFee && typeof entryFee == 'object' && entryFee.key == "Entry Fee")) {
        return 0;
    }

    const amount = entryFee.value;

    return amount;
}

exports.calculateWalletAmount = function (user = {}) {
    return user.wallet_cash_balance;
}
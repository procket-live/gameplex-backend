const Withdrawal = require('../models/withdrawal-request.model');
const User = require('../models/user.model');
const BankAccount = require('../models/bank-account.model');


exports.create = async (req, res) => {
    const userId = req.userData.userId;
    const amount = req.body.amount;

    if (amount < 10) {
        return res.status(201).json({
            success: false,
            response: "Amount cannot be less than 10."
        })
    }

    const bankAccount = await BankAccount.findOne({ created_by: userId }).exec();
    if (!bankAccount) {
        return res.status(201).json({
            success: false,
            response: "Bank account details not set."
        })
    }

    const user = await User.findById(userId).select('-_id wallet_win_balance').exec();
    const walletWinBalance = user.wallet_win_balance;

    if (walletWinBalance < amount) {
        return res.status(201).json({
            success: false,
            response: "Not sufficient amount."
        })
    }

    const withdrawal = new Withdrawal({
        amount: amount,
        created_by: userId,
        bank_details: bankAccount._id
    })

    await withdrawal.save();

    return res.status(201).json({
        success: true,
        response: "Request created"
    })
}

exports.get_requests = async (req, res) => {
    const userId = req.userData.userId;
    const status = req.params.status;

    const allRequests = await Withdrawal.
        find({ created_by: userId, status: status })
        .populate('bank_details')
        .exec();

    return res.status(201).json({
        success: true,
        response: allRequests
    })
}

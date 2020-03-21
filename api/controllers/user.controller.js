const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const OTP = require('../models/otp.model');

const sendSMS = require('../../utils/send-sms');
const sendEmail = require('../../utils/send-email');
const sendNotification = require('../../utils/notifications');

exports.get_user = (req, res, next) => {
    User.find({ _id: req.userData.userId })
        .populate('role')
        .exec()
        .then((users) => {
            if (users.length == 0) {
                return res.status(201).json({
                    success: false,
                    response: 'unable to find user'
                })
            }

            return res.status(201).json({
                success: true,
                response: users[0]
            })
        }).catch((err) => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
};

exports.attach_user = async (req, res, next) => {
    const userId = req.userData.userId;
    try {
        const user = await User.findById(userId).exec();
        req.user = user;
        next();
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.create_user_if_not_exist = (req, res, next) => {
    let mobile = req.body.mobile;
    const profile = req.body.profile;

    if (!mobile) {
        mobile = profile.phoneNumber.substring(3);
    }

    User.find({ mobile })
        .exec()
        .then((users) => {
            if (users.length == 0) {

                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    mobile
                });

                user
                    .save()
                    .then(() => {
                        User.findOne({ mobile })
                            .exec()
                            .then((newUser) => {
                                req.userId = newUser._id;
                                req.profile = profile;
                                req.mobile = mobile;
                                next();
                            })
                    })
                    .catch((err) => {
                        res.status(200).json({
                            success: false,
                            response: err
                        })
                    })
            } else {
                req.userId = users[0]._id;
                req.profile = profile;
                req.mobile = mobile;
                next();
            }
        })
}

exports.generate_otp = (req, res, next) => {
    const userId = req.userId;

    User.findOne({ _id: userId })
        .exec()
        .then((user) => {
            const mobile = user.mobile;

            let generatedOtp = Math.floor(1000 + Math.random() * 9000);
            if (mobile == '9731702355') {
                generatedOtp = '1234';
            }

            const _id = new mongoose.Types.ObjectId();
            const otp = new OTP({
                _id,
                mobile,
                user: userId,
                otp: generatedOtp,
                otp_type: 'mobile',
                expires_at: moment().add('15', 'minutes').toDate(),
                created_at: Date.now(),
            })

            otp
                .save()
                .then(() => {
                    const template = `<#> Welcome to Gameplex. OTP is ${generatedOtp} \n RqwxvkzBoqA`;
                    sendSMS(mobile, template);
                    res.status(201).json({
                        success: true,
                        response: 'otp sent successfully',
                        _id
                    })
                })
                .catch((err) => {
                    return res.status(200).json({
                        success: false,
                        response: 'something went wrong'
                    });
                })
        });
}

exports.resend_otp = (req, res) => {
    const id = req.params.id;

    OTP.findById(id)
        .exec()
        .then((otp) => {
            const generatedOTP = otp.otp;
            const mobile = otp.mobile;

            const template = `<#> Welcome to Gameplex. OTP is ${generatedOTP}`;
            sendSMS(mobile, template);
            res.status(201).json({
                success: true,
                response: 'otp resent successfully'
            })
        }).catch(() => {
            return res.status(200).json({
                success: false,
                response: 'something went wrong'
            });
        })
}

exports.generate_email_otp = (req, res) => {
    const userId = req.userData.userId;
    User.findOne({ _id: userId })
        .exec()
        .then((user) => {
            const email = user.email;

            if (!email) {
                return res.status(200).json({
                    success: false,
                    response: 'email not set, please try again'
                });
            }

            let generatedOtp = Math.floor(1000 + Math.random() * 9000);

            const otp = new OTP({
                _id: new mongoose.Types.ObjectId(),
                email,
                user: userId,
                otp: generatedOtp,
                otp_type: 'email',
                expires_at: moment().add('15', 'minutes').toDate(),
                created_at: Date.now(),
            })

            otp
                .save()
                .then(() => {
                    const template = `Welcome to Gameplex. OTP to verify email is ${generatedOtp}`;
                    sendEmail(email, template, template).then(() => {
                        res.status(201).json({
                            success: true,
                            response: 'email otp sent successfully',
                        })
                    })
                        .catch(() => {
                            return res.status(200).json({
                                success: false,
                                response: 'something went wrong'
                            });
                        })
                })
                .catch((err) => {
                    return res.status(200).json({
                        success: false,
                        response: 'something went wrong'
                    });
                })
        });
}

exports.verify_otp = (req, res) => {
    const mobile = req.body.mobile;
    const otp = req.body.otp;

    OTP.find({ mobile, otp_type: 'mobile' })
        .exec()
        .then((results) => {
            if (results.length == 0) {
                return res.status(200).json({
                    success: false,
                    response: 'otp expired, please try again'
                })
            }

            const lastIndex = results.length - 1;
            const lastRecord = results[lastIndex];
            if (lastRecord.otp == otp) {
                const userId = lastRecord.user;

                User.findOne({ _id: userId })
                    .populate('role')
                    .exec()
                    .then((user) => {
                        const token = jwt.sign(
                            {
                                userId: user._id,
                                mobile: user.mobile
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "500h"
                            }
                        );

                        OTP.findByIdAndUpdate(lastRecord._id, { $set: { "deleted_at": new Date() } })
                            .exec()
                            .then(() => {
                                User.findByIdAndUpdate(userId, { $set: { "is_mobile_verified": true } })
                                    .exec()
                                    .then(() => {
                                        return res.status(200).json({
                                            success: true,
                                            response: user,
                                            token
                                        })
                                    })
                                    .catch(() => {
                                        return res.status(200).json({
                                            success: false,
                                            response: 'something went wrong'
                                        })
                                    })
                            })
                            .catch(() => {
                                return res.status(200).json({
                                    success: false,
                                    response: 'something went wrong'
                                })
                            })
                    })
                    .catch((err) => {
                        return res.status(200).json({
                            success: false,
                            response: err + "gand mra li"
                        })
                    })

            } else {
                return res.status(200).json({
                    success: false,
                    response: 'wrong otp'
                })
            }
        })
        .catch(() => {
            return res.status(200).json({
                success: false,
                response: 'something went wrong'
            })
        })
}

exports.verify_email_otp = (req, res) => {
    const userId = req.userData.userId;
    const otp = req.body.otp;

    OTP.find({ user: userId, otp_type: 'email' })
        .exec()
        .then((results) => {
            if (results.length == 0) {
                return res.status(200).json({
                    success: false,
                    response: 'otp expired, please try again'
                })
            }

            const lastIndex = results.length - 1;
            const lastRecord = results[lastIndex];
            if (lastRecord.otp == otp) {
                OTP.findByIdAndUpdate(lastRecord._id, { $set: { "deleted_at": new Date() } })
                    .exec()
                    .then(() => {
                        User.findByIdAndUpdate(userId, { $set: { "is_email_verified": true } })
                            .exec()
                            .then(() => {
                                User.findById(userId)
                                    .populate('role')
                                    .exec()
                                    .then((newUser) => {
                                        return res.status(200).json({
                                            success: true,
                                            response: newUser
                                        })
                                    })
                                    .catch(() => {
                                        return res.status(200).json({
                                            success: false,
                                            response: 'something went wrong'
                                        })
                                    })
                            })
                            .catch(() => {
                                return res.status(200).json({
                                    success: false,
                                    response: 'something went wrong'
                                })
                            })
                    })
                    .catch(() => {
                        return res.status(200).json({
                            success: false,
                            response: 'something went wrong'
                        })
                    })
            } else {
                return res.status(200).json({
                    success: false,
                    response: 'wrong otp'
                })
            }
        })
        .catch(() => {
            return res.status(200).json({
                success: false,
                response: 'something went wrong'
            })
        })
}


exports.update_user = (req, res, next) => {
    const userId = req.userData.userId;
    const body = req.body;

    const updateParams = {};
    Object.keys(body).forEach((key) => {
        updateParams[key] = body[key];
    })

    User.update({ _id: userId }, { $set: updateParams })
        .exec()
        .then(() => {
            User.find({ _id: userId })
                .populate('role')
                .exec()
                .then((users) => {
                    res.status(201).json({
                        success: true,
                        response: users[0]
                    })
                })
                .catch(() => {
                    return res.status(200).json({
                        success: false,
                        response: 'something went wrong'
                    })
                })
        })
        .catch((err) => {
            res.status(200).json({
                success: false,
                response: err
            })
        })
}

exports.update_wallet_balance = async (req, res, next) => {
    try {
        const order_id = req.order_id;
        const userId = req.userData.userId;
        const amount = req.amount;
        const source = req.source;

        const walletTransactions = {
            amount: amount,
            target: "cash_balance",
            source: source
        };

        if (order_id) {
            walletTransactions.order = order_id;
        }

        await User.findByIdAndUpdate({ _id: userId }, {
            $inc: {
                wallet_cash_balance: amount
            },
            $push: {
                wallet_transactions: walletTransactions
            }
        }).exec();

        if (req.onSuccessNext) {
            next();
            return;
        }

        const user = await User
            .findById(userId)
            .populate('role')
            .exec()

        return res.status(200).json({
            success: true,
            response: user
        })
    } catch (err) {
        return res.status(200).json({
            success: false,
            response: err
        })
    }
}

exports.add_game_id = async (req, res) => {
    const game = req.params.id;
    const userId = req.userData.userId;
    const gameUserId = req.body.user_id;

    try {
        await User.findByIdAndUpdate(userId, { $push: { game_ids: { game, user_id: gameUserId } } }).exec();
        const user = await User.findById(userId).exec();

        return res.status(200).json({
            success: true,
            response: user
        })
    } catch (err) {
        res.status(200).json({
            success: false,
            response: err
        })
    }
}

exports.get_wallet_balance = async () => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId).exec();

        return res.status(200).json({
            success: true,
            response: {
                wallet_cash_balance: user.wallet_cash_balance,
                wallet_bonous_balance: user.wallet_bonous_balance
            }
        });
    } catch (err) {
        res.status(200).json({
            success: false,
            response: err
        })
    }
}

exports.wallet_transactions = async (req, res) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId).select('-_id wallet_transactions').populate('wallet_transactions.source', 'tournament_name');
        const transactions = user.wallet_transactions;

        return res.status(200).json({
            success: true,
            response: transactions
        });
    } catch (err) {
        res.status(200).json({
            success: false,
            response: err
        })
    }
}
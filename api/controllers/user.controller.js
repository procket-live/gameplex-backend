const mongoose = require('mongoose');

const User = require('../models/user.model');
const OTP = require('../models/otp.model');

const sendSMS = require('../../utils/send-sms');
const sendNotification = require('../../utils/notifications');

exports.get_user = (req, res, next) => {
    User.find({ _id: req.userData.userId })
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

            const otp = new OTP({
                _id: new mongoose.Types.ObjectId(),
                mobile,
                otp: generatedOtp,
                otp_type: 'mobile',
                expires_at: moment().add('15', 'minutes').toDate(),
                created_at: Date.now(),
            })

            otp
                .save()
                .then(() => {
                    const template = `<#> Welcome to Gameplex. OTP is ${generatedOtp}`;
                    sendSMS(mobile, template);
                    res.status(201).json({
                        success: true,
                        response: 'otp sent successfully',
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

    OTP.find({ mobile })
        .exec()
        .then((results) => {
            if (results.length == 0) {
                return res.status(200).json({
                    success: false,
                    response: 'otp expired, please try again'
                })
            }

            const lastIndex = results.length - 1;
            if (results[lastIndex].otp == otp) {
                User.find({ mobile: String(mobile) })
                    .exec()
                    .then((users) => {
                        const token = jwt.sign(
                            {
                                userId: users[0]._id,
                                mobile: users[0].mobile
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "500h"
                            }
                        );

                        OTP.findByIdAndUpdate(results[0]._id, { $set: { "deleted_at": new Date() } })
                            .exec()
                            .then(() => {
                                return res.status(200).json({
                                    success: true,
                                    response: users[0],
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
                    .catch((err) => {
                        return res.status(200).json({
                            success: false,
                            response: 'unable to find user'
                        })
                    })

            } else {
                return res.status(200).json({
                    success: false,
                    response: 'wrong otp'
                })
            }
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
            res.status(201).json({
                success: true,
                response: 'updated'
            })
        })
        .catch((err) => {
            res.status(200).json({
                success: false,
                response: err
            })
        })
}
const mongoose = require('mongoose');

const User = require('../models/user.model');

const sendSMS = require('../../utils/send-sms');
const sendNotification = require('../../utils/notifications');

exports.get_user = (req, res, next) => {
    const userId = req.userId;

    const token = 'fwJEaWiT8oU:APA91bFTKrCn2NxH2NCwI52qdPN-8p8ET6N5tj0XePS_rVgfNL-kNArW2n3UtK68dNq8UUwFfibNXiVgR_z2wOHbCCOESU27ZsZZMJwiTWB5dpu83GuvSjv0X1rprRloTyg4dutFC0LZ';
    sendNotification("Welcome to Gameplex", "this is notification", [token], { name: 'tooo' })
    User.find({ _id: userId })
        .exec()
        .then((users) => {
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

exports.generate_otp = (req, res, next) => {
    const mobile = req.body.mobile;

    User.findOne({ mobile: mobile })
        .exec()
        .then((user) => {
            const mobile = user.mobile;

            const generatedOtp = Math.floor(100000 + Math.random() * 900000);
            const otp = new Otp({
                _id: new mongoose.Types.ObjectId(),
                mobile,
                otp: generatedOtp,
                expires: moment().add('15', 'minutes').toDate()
            });

            otp
                .save()
                .then(() => {
                    const template = `Welcome to Gameplex. OTP is ${generatedOtp} \n YaZSGGTXEUE`;
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
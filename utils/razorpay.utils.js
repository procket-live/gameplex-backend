const Razorpay = require('razorpay');
const HmacSHA256 = require('crypto-js/hmac-sha256');

exports.getRazorpayInstance = function () {
    return new Razorpay({
        key_id: process.env.RAZORPAY_ID,
        key_secret: process.env.RAZORPAY_SECRET
    })
}

exports.generateSignature = function (razorpay_order_id, razorpay_payment_id) {
    return HmacSHA256(razorpay_order_id + "|" + razorpay_payment_id, process.env.RAZORPAY_SECRET);
}
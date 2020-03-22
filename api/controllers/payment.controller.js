const mongoose = require('mongoose');

const Razorpay = require('../../utils/razorpay.utils');
const Order = require('../models/order.model');

exports.generate_order = (req, res) => {
    const userId = req.userData.userId;
    const amount = req.body.amount;

    const instance = Razorpay.getRazorpayInstance();
    console.log('instance', instance)
    const _id = new mongoose.Types.ObjectId();

    var options = {
        amount: parseInt(amount) * 100,
        currency: "INR",
        receipt: String(_id),
        payment_capture: '0'
    };

    instance.orders.create(options, function (err, order) {
        if (err) {
            return res.status(201).json({
                success: false,
                response: err
            });
        }

        new Order({
            _id: _id,
            order_id: order.id,
            target_ref: userId,
            target: "User",
            user: userId,
            amount: amount,
            generate_response: order,
            created_by: userId,
        })
            .save()
            .then(() => {
                return res.status(201).json({
                    success: true,
                    response: {
                        order_id: order.id,
                    }
                });
            })
            .catch((err) => {
                return res.status(201).json({
                    success: false,
                    response: err
                });
            })
    });


}

exports.validate_payment = async (req, res, next) => {
    const razorpay_payment_id = req.body.razorpay_payment_id;
    const razorpay_order_id = req.body.razorpay_order_id;
    const razorpay_signature = req.body.razorpay_signature;
    const code = req.body.code;

    if (code == 0) {
        Order.findOneAndUpdate({ order_id: razorpay_order_id }, {
            $set: {
                status: "failed",
                updated_at: Date.now()
            }
        }).exec();
        return;
    }

    const generate_signature = Razorpay.generateSignature(razorpay_order_id, razorpay_payment_id);

    if (razorpay_signature != generate_signature) {
        return res.status(201).json({
            success: false,
            response: "Wrong Signature"
        });
    }
    try {
        const order = await Order.findOne({ order_id: razorpay_order_id }).exec();
        await Order.findOneAndUpdate({ _id: order._id }, {
            $set: {
                status: "success",
                success_response: {
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature
                },
                updated_at: Date.now()
            }
        }).exec();
        req.amount = order.amount;
        req.order_id = order.razorpay_order_id;
        req.source = order._id;
        next();
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        });
    }
}
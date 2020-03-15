const mongoose = require('mongoose');
const uniqid = require('uniqid');

const Order = require('../models/order.model');

exports.create_order = async (req, res, next) => {
    try {
        const userId = req.userData.userId;
        const amount = req.body.amount;
        const organizer = req.body.organizer_id;
        const source = req.body.tournament_id;

        const orderId = uniqid('game-', '-plex');
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            amount: amount,
            order_id: orderId,
            created_by: userId,
            target_ref: organizer,
            source: source,
        });

        await order.save();
        const orderRecord = await Order.findById(orderId).exec();

        return res.status(201).json({
            success: true,
            response: orderRecord
        })
    } catch (err) {
        return res.status(201).json({
            success: true,
            response: err
        });
    }
}

exports.is_paid = async (req, res, next) => {
    const userId = req.userData.userId;
    const amount = req.body.amount;
    const organizer = req.body.organizer_id;
    const source = req.body.tournament_id;

    try {
        const orders = await Order.find({
            created_by: userId,
            target_ref: organizer,
            source: source,
            amount: amount,
            status: { $ne: "failed" }
        }).exec();

        if (orders.length) {
            //already paid
            return res.status(201).json({
                success: true,
                response: orders[0]
            })
        }

        next();
        return;
    } catch (err) {
        return res.status(201).json({
            success: true,
            response: err
        });
    }
}

exports.is_status_updated = async (req, res, next) => {
    const order_id = req.order_id;

    try {
        const orders = await Order.find({ order_id: order_id, status: "pending" }).exec()
        if (orders.length == 0) {
            res.status(201).json({
                success: false,
                response: 'order not found'
            });
            return;
        }

        next();
        return;
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        });
    }

}

exports.update_order_status = async (req, res, next) => {
    try {
        const orderId = req.body.order_id;
        const response = req.body.string_response;
        const jsonResponse = JSON.parse(response);

        const status = jsonResponse.status || jsonResponse.Status;
        if (status == "Success" || status == "SUCCESS") {
            await Order.update({ order_id: orderId }, { status: 'success', response: response }).exec();
            const order = await Order.findOne({ order_id: order }).exec();
            return res.status(201).json({
                success: true,
                response: order
            })
        }

        return res.status(201).json({
            success: false,
        });

    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        });
    }
}

exports.add_document = async (req, res) => {
    try {
        const orderId = req.body.order_id;

        await Order.update({ order_id: orderId }, { $push: { document_links: req.body.document } }).exec();
        const order = await Order.findOne({ order_id: order }).exec();
        return res.status(201).json({
            success: true,
            response: order
        });
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        });
    }
}

exports.get_transactions = async (req, res) => {
    const userId = req.userData.userId;

    try {
        const orders = await Order
            .find({ created_by: userId })
            .populate('target_ref')
            .populate('source', 'tournament_name')
            .sort({ updated_at: 'desc' })
            .exec();

        return res.status(201).json({
            success: true,
            response: orders
        })

    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        });
    }
}
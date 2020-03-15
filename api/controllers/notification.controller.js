const mongoose = require('mongoose');

const Notification = require('../models/game.model');

exports.get_all = async (req, res) => {
    try {
        const result = await Notification
            .find({ _id: req.userData.userId })
            .exec()

        res.status(201).json({
            success: true,
            response: result
        })
    } catch (err) {
        res.status(201).json({
            success: true,
            response: err
        })
    }
}

exports.add = (req, res) => {
    const notification = Notification({
        _id: new mongoose.Types.ObjectId(),
        user: req.userId,
        message: req.body.message,
        created_at: new Date(),
        update_at: new Date(),
        created_by: req.userId
    });

    notification
        .save()
        .then(() => {
            res.status(201).json({
                success: true,
                response: 'game added'
            })
        })
        .catch((err) => {
            res.status(201).json({
                success: true,
                response: err
            })
        })
}
const mongoose = require('mongoose');

const Organizer = require('../models/organizer.model');

exports.get_organizer_profile = async (req, res, next) => {
    const userId = req.userData.userId;
    try {
        const organizer = await Organizer.findOne({ user: userId }).exec();
        if (organizer) {
            req.organizer = organizer;
            next();
            return;
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

exports.create_organizer_profile = async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const _id = new mongoose.Types.ObjectId();
        const organizer = new Organizer({
            _id,
            user: userId,
            organizer_name: req.body.organizer_name,
            upi_address: req.body.upi_address
        });

        await organizer.save();

        const organizerResult = await Organizer.findById(_id).exec();

        return res.status(201).json({
            success: true,
            response: organizerResult
        });
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        });
    }
}

exports.update_organizer_profile = async (req, res, next) => {
    const userId = req.userData.userId;

    const set = {};
    if (req.body.upi_address) {
        set['upi_address'] = req.body.upi_address;
    }
    if (req.body.organizer_name) {
        set['organizer_name'] = req.body.organizer_name;
    }

    try {
        const organizer = Organizer
            .findByIdAndUpdate({ user: userId }, {
                $set: set
            }).exex();

        if (organizer) {
            return res.status(201).json({
                success: true,
                response: organizer
            });
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
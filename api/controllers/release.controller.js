const AppRelease = require('../models/release.model');

exports.get_latest = async (req, res) => {
    try {
        const result = await AppRelease
            .findOne({ active: true }, {}, { sort: { 'created_at': -1 } })
            .exec();


        res.status(201).json({
            success: true,
            response: result
        })
    } catch (err) {
        res.status(201).json({
            success: false,
            response: err
        })
    }
};
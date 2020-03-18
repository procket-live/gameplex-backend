const Offer = require('../models/offer.model');

exports.get_all = async (req, res) => {
    try {
        const result = await Offer
            .find({ active: true })
            .exec();

        res.status(201).json({
            success: true,
            response: result
        })
    } catch (err) {
        res.status(201).json({
            success: false,
            response: []
        })
    }
}
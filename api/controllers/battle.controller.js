const Battle = require('../models/battle.model');

exports.get_all = async (req, res) => {
    try {
        const result = await Battle
            .find({ active: true })
            .populate('game')
            .populate('offers')
            .populate('instructions')
            .populate('match_list')
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
}
const mongoose = require('mongoose');

const Game = require('../models/game.model');
const Platform = require('../models/platform.model');

exports.get_dashboard_meta = async (req, res) => {
    try {
        const games = await Game.find().exec();
        const platforms = await Platform.find().exec();

        res.status(201).json({
            success: true,
            response: {
                game: games,
                platform: platforms,
                draft: 0,
                active: 0,
                completed: 0
            }
        })
    } catch (err) {
        res.status(201).json({
            success: false,
            response: err
        })
    }
}
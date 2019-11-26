const mongoose = require('mongoose');

const Game = require('../models/game.model');
const Tournament = require('../models/tournament.model');

exports.get_dashboard_meta = async (req, res) => {
    try {
        const games = await Game.find().populate('game_meta.lookup_type').exec();
        const draftTournaments = await Tournament.find({ status: 'draft' }).exec();
        const activeTournaments = await Tournament.find({ status: 'active' }).exec();
        const completeTournaments = await Tournament.find({ status: 'completed' }).exec();

        res.status(201).json({
            success: true,
            response: {
                game: games,
                draft: draftTournaments.length,
                active: activeTournaments.length,
                completed: completeTournaments.length
            }
        })
    } catch (err) {
        res.status(201).json({
            success: false,
            response: err
        })
    }
}
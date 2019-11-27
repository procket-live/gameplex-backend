const mongoose = require('mongoose');

const Game = require('../models/game.model');
const Tournament = require('../models/tournament.model');

exports.get_dashboard_meta = async (req, res) => {
    const userId = req.userData.userId;

    try {
        const games = await Game.find().populate('game_meta.lookup_type').exec();
        const draftTournaments = await Tournament.find({ status: 'draft', created_by: userId, deleted_at: null }).exec();
        const activeTournaments = await Tournament.find({ status: 'active', created_by: userId, deleted_at: null }).exec();
        const completeTournaments = await Tournament.find({ status: 'completed', created_by: userId, deleted_at: null }).exec();

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
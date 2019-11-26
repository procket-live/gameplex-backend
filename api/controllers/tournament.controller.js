const mongoose = require('mongoose');

const Tournament = require('../models/tournament.model');

exports.get = (req, res) => {
    Tournament
        .findOne({ _id: req.params.id })
        .populate('game')
        .populate({
            path: 'game',
            populate: {
                path: 'platform'
            }
        })
        .populate({
            path: 'game',
            populate: {
                path: 'game_meta.lookup_type',
            }
        })
        .exec()
        .then((result) => {
            res.status(201).json({
                success: true,
                response: result,
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            });
        })
}

exports.get_all = (req, res) => {
    Tournament
        .find(req.query)
        .populate('game')
        .populate('game.platform')
        .exec()
        .then((results) => {
            return res.status(201).json({
                success: true,
                response: results,
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            });
        })
}

exports.add = (req, res) => {
    const tournament = new Tournament({
        _id: new mongoose.Types.ObjectId(),
        tournament_name: req.body.tournament_name,
        description: req.body.description,
        game: req.body.game,
        size: req.body.platform,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.userId
    });

    tournament
        .save()
        .then((result) => {
            res.status(201).json({
                success: true,
                response: result,
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            });
        })
}

exports.edit = (req, res) => {
    Tournament
        .update({ _id: req.params.id }, {
            $set: req.body
        })
        .exec()
        .then(() => {
            Tournament
                .findById(req.params.id)
                .populate('game')
                .populate({
                    path: 'game',
                    populate: {
                        path: 'platform'
                    }
                })
                .populate({
                    path: 'game',
                    populate: {
                        path: 'game_meta.lookup_type',
                    }
                })
                .exec()
                .then((tournament) => {
                    res.status(201).json({
                        success: true,
                        response: tournament
                    })
                })
                .catch((err) => {
                    return res.status(200).json({
                        success: false,
                        response: err
                    });
                })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            });
        })
}
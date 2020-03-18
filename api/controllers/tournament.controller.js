const mongoose = require('mongoose');

const Tournament = require('../models/tournament.model');
const Participent = require('../models/participent.model');
const Order = require('../models/order.model');
const TournamentUtils = require('../../utils/tournament.utils');

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
    const userId = req.userData.userId;
    const query = req.query;
    query['created_by'] = userId;
    query['deleted_at'] = null;

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

exports.get_upcoming = (req, res) => {
    const filter = {
        status: 'active',
        deleted_at: null,
        tournament_start_time: { $gt: Date.now() }
    };

    if (req.params.id) { //userId
        filter['participents'] = { $contains: req.params.id }
    }

    Tournament
        .find(filter)
        .populate('game')
        .populate('game.platform')
        .populate('organizer')
        .populate({
            path: 'participents',
            populate: {
                path: 'user',
                select: 'name profile_image'
            }
        })
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

exports.get_upcoming_active = (req, res) => {
    const userId = req.userData.userId;

    const filter = {
        deleted_at: null,
        tournament_start_time: { $gt: Date.now() },
        'participents.user._id': userId
    };
    console.log('filter', filter)

    Tournament
        .find(filter)
        .populate('game')
        .populate('game.platform')
        .populate('organizer')
        .populate({
            path: 'participents',
            populate: {
                path: 'user',
                select: 'name profile_image'
            }
        })
        .exec()
        .then((results) => {
            console.log('results', results)
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
    const userId = req.userData.userId;

    const tournament = new Tournament({
        _id: new mongoose.Types.ObjectId(),
        tournament_name: req.body.tournament_name,
        description: req.body.description,
        organizer: req.body.organizer_id,
        game: req.body.game,
        size: req.body.size,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: userId
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
    const userId = req.userData.userId;

    Tournament
        .update({ _id: req.params.id, created_by: userId }, {
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

exports.join_tournament = async (req, res, next) => {
    const userId = req.userData.userId;
    const tournamentId = req.params.id;
    const order_id = req.body.order_id;

    try {
        const order = await Order.findOne({ order_id: order_id }).exec();
        const participentId = new mongoose.Types.ObjectId();
        const participent = new Participent({
            _id: participentId,
            user: userId,
            tournament: tournamentId,
            order: order._id
        });

        if (order.status !== "success") {
            return res.status(200).json({
                success: false,
                response: 'Please complete payment first.'
            });
        }

        await participent.save();
        await Tournament.update({ _id: tournamentId }, { $push: { participents: participentId } }).exec();
        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        return res.status(200).json({
            success: false,
            response: err
        });
    }
}

exports.is_alredy_joined = async (req, res, next) => {
    const userId = req.userData.userId;
    const tournamentId = req.params.id;
    const order_id = req.body.order_id;

    const order = await Order.findOne({ order_id: order_id }).exec();
    const participents = await Participent.find({ tournament: tournamentId, user: userId, order: order._id }).exec();

    if (participents.length !== 0) {
        return res.status(200).json({
            success: false,
            response: 'Already joined'
        });
    }

    next();
}

exports.finish_joining = async (req, res) => {
    const userId = req.userData.userId;
    const tournament = req.tournament;
    const id = tournament._id;

    try {
        await Tournament.findByIdAndUpdate(id, {
            $push: {
                participents: {
                    user: userId,
                    collection_amount: req.amount
                }
            }
        })
        return res.status(200).json({
            success: true,
            response: 'Joined'
        });
    } catch (err) {
        return res.status(200).json({
            success: false,
            response: err
        });
    }
}

exports.get_participents = async (req, res) => {
    const id = req.params.id;

    try {
        const tournament = await Tournament
            .findById(id)
            .populate({
                path: 'participents',
                populate: {
                    path: 'user',
                    select: 'name profile_image'
                }
            })
            .populate({
                path: 'participents',
                populate: {
                    path: 'order'
                }
            })
            .exec();
        const participents = tournament.participents;

        return res.status(200).json({
            success: true,
            response: participents
        });
    } catch (err) {
        return res.status(200).json({
            success: false,
            response: err
        });
    }
}

exports.set_ranking = async (req, res) => {
    const id = req.params.id;
    const record = req.body.record || [];

    try {
        record.forEach(async (item) => {
            await Participent.findByIdAndUpdate(item.participentId, {
                $set: {
                    result_meta: item.result_meta
                }
            }).exec().then((result) => {
                console.log('resultTTT', result);
            });
        })

        await Tournament.findByIdAndUpdate(id, { $set: { ranking_set: true } }).exec();
        const result = await Tournament
            .findById(id)
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
            .exec();

        return res.status(200).json({
            success: true,
            response: result
        });
    } catch (err) {
        return res.status(200).json({
            success: false,
            response: err
        });
    }
}

exports.calculate = async (req, res) => {

}
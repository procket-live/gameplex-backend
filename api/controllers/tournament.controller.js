const mongoose = require('mongoose');

const Tournament = require('../models/tournament.model');
const Participent = require('../models/participent.model');
const User = require('../models/user.model');
const TournamentUtils = require('../../utils/tournament.utils');

exports.get = (req, res) => {
    let tournamentId = req.params.id;

    if (req.tournamentId) {
        tournamentId = req.tournamentId;
    }

    Tournament
        .findOne({ _id: tournamentId })
        .populate('game')
        .populate({
            path: 'game',
            populate: {
                path: 'platform'
            }
        })
        .populate({
            path: 'participents',
            populate: {
                path: 'user',
                select: 'name profile_image'
            }
        })
        .populate({
            path: 'game',
            populate: {
                path: 'game_meta.lookup_type',
            }
        })
        .populate({
            path: 'game',
            populate: 'instructions'
        })
        .populate({
            path: 'game',
            populate: 'guide'
        })
        .exec()
        .then((result) => {
            return res.status(201).json({
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
        .populate({
            path: 'game',
            populate: 'instructions'
        })
        .populate({
            path: 'game',
            populate: 'guide'
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
        .populate({
            path: 'game',
            populate: {
                path: 'instructions'
            }
        })
        .populate({
            path: 'game',
            populate: {
                path: 'guide'
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
        .populate({
            path: 'game',
            populate: 'instructions'
        })
        .populate({
            path: 'game',
            populate: 'guide'
        })
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
    let tournamentId = req.params.id;

    if (req.tournamentId) {
        tournamentId = req.tournamentId;
    }

    if (req.alreadyJoined) {
        next();
        return;
    }

    try {
        const tournament = await Tournament.findById(tournamentId).exec();
        const user = await User.findById(userId).exec();
        const entryFee = TournamentUtils.calculateEntryFee(tournament.prize || []);
        const walletBalance = TournamentUtils.calculateWalletAmount(user);

        if (entryFee > walletBalance) {
            return res.status(200).json({
                success: false,
                response: 'Insufficient wallet balance'
            });
        }

        const walletTransaction = {
            amount: -entryFee,
            target: "cash_balance",
            source: tournamentId,
            source_name: "Tournament"
        };


        await User.findByIdAndUpdate(userId, {
            $inc: {
                wallet_cash_balance: -entryFee
            },
            $push: {
                wallet_transactions: walletTransaction
            }
        }).exec();


        const participentId = new mongoose.Types.ObjectId();
        const participent = new Participent({
            _id: participentId,
            user: userId,
            tournament: tournamentId,
            wallet_transaction: walletTransaction
        });

        await participent.save();
        await Tournament.update({ _id: tournamentId }, { $push: { participents: participentId } }).exec();

        if (req.skipResponse) {
            next();
            return;
        }

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
    let tournamentId = req.params.id;

    if (req.tournamentId) {
        tournamentId = req.tournamentId;
    }

    const participents = await Participent.find({ tournament: tournamentId, user: userId }).exec();
    if (participents.length !== 0) {
        if (req.battleQueueEntry) {
            req.alreadyJoined = true;
            next();
            return;
        }

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

exports.get_my_tournaments = async (req, res) => {
    const userId = req.userData.userId;

    try {
        const result = await Participent
            .find({ user: userId }, '-_id tournament')
            .populate(
                {
                    path: 'tournament',
                    populate: {
                        path: 'game',
                        populate: 'platform'
                    }
                })
            .exec();

        const joined = [];
        const completed = [];

        result.forEach((item = {}) => {
            if (item.tournament.status == "completed") {
                completed.push(item.tournament);
            } else {
                joined.push(item.tournament);
            }
        })

        return res.status(200).json({
            success: true,
            response: {
                joined,
                completed
            }
        });
    } catch (err) {
        return res.status(200).json({
            success: false,
            response: err
        });
    }
}
const mongoose = require('mongoose');

const Battle = require('../models/battle.model');
const Match = require('../models/match.model');
const User = require('../models/user.model');
const BattleQueue = require('../models/battle-queue.model');
const Tournament = require('../models/tournament.model');

const TournamentUtils = require('../../utils/tournament.utils');
const UsernameGenerator = require('username-generator');

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

exports.attach_match = async (req, res) => {
    const matchId = req.params.id;

    try {
        const match = await Match.findById(matchId).populate('battle').exec();
        console.log('match', match);
        if (match == null) {
            return res.status(201).json({
                success: false,
                response: 'match not found'
            })
        }

        req.match = match;
        next();
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.is_enough_wallet_amount = async (req, res) => {
    const userId = req.userData.userId;
    const match = req.match;

    try {
        const user = await User.findById(userId).select('-_id wallet_cash_balance').exec();
        const walletAmount = TournamentUtils.calculateWalletAmount(user);
        const entryFee = parseInt(match.entry_fee);

        if (walletAmount < entryFee) {
            return res.status(201).json({
                success: false,
                response: "insufficient wallet amount"
            })
        }

        next();

    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.find_queue_entry = async (req, res) => {
    const matchId = req.params.id;

    try {
        const results = await BattleQueue.find({ match: matchId, $eq: { deleted_at: null } }).exec();
        if (results.length) {
            req.battleQueueEntry = results[0];
        }

        next()
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.create_tournament_for_match = async (req, res) => {
    const userId = req.userData.userId;
    const match = req.match;
    const battle = match.battle;

    req.skipResponse = true;

    if (req.battleQueueEntry) {
        req.tournamentId = battleQueueEntry.tournament;
        next();
    }


    const randomname = UsernameGenerator.generateUsername();
    const _id = new mongoose.Types.ObjectId();

    const tournament = new Tournament({
        _id,
        status: 'active',
        game: battle.game,
        tournament_name: match.name + "_" + randomname,
        prize: [
            {
                key: "entryFee",
                value: match.entry_fee
            },
            {
                key: "prizePool",
                value: match.winning_amount
            }
        ],
        size: 2,
        registration_opening: Date.now(),
        registration_closing: null,
        tournament_start_time: null,
        created_by: userId
    });

    tournament
        .save()
        .then(() => {
            req.tournamentId = _id;
            const battleQueueId = new mongoose.Types.ObjectId();
            const battleQueueEntry = new BattleQueue({
                _id: battleQueueId,
                match: match._id,
                user: userId,
                tournament: _id,
                created_by: userId
            });

            battleQueueEntry
                .save()
                .then((entry) => {
                    req.battleQueueEntry = entry;
                    next();
                })
                .catch((err) => {
                    return res.status(201).json({
                        success: false,
                        response: err
                    })
                })
        })
        .catch(() => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
}

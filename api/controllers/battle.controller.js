const mongoose = require('mongoose');

const Battle = require('../models/battle.model');
const Match = require('../models/match.model');
const User = require('../models/user.model');
const BattleQueue = require('../models/battle-queue.model');
const Tournament = require('../models/tournament.model');
const ChatRoom = require('../models/chat-room.model');

const Notify = require('../controllers/notify.controller');

const TournamentUtils = require('../../utils/tournament.utils');

const WEB = require('../../web');

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

exports.attach_match = async (req, res, next) => {
    const matchId = req.params.id;

    try {
        const match = await Match.findById(matchId).populate('battle').exec();
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

exports.is_enough_wallet_amount = async (req, res, next) => {
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

exports.find_queue_entry = async (req, res, next) => {
    const matchId = req.params.id;
    const userId = req.userData.userId;

    try {
        const results = await BattleQueue.find({
            match: matchId,
            created_by: {
                $ne: userId,
            },
            full: false
        }).exec();
        if (results.length > 0) {
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

exports.create_tournament_for_match = async (req, res, next) => {
    const userId = req.userData.userId;
    const match = req.match;
    const battle = match.battle;

    req.skipResponse = true;
    if (req.battleQueueEntry) {
        req.tournamentNotCreated = true;
        req.tournamentId = req.battleQueueEntry.tournament;
        next();
        return;
    }

    const _id = new mongoose.Types.ObjectId();
    const tournament = new Tournament({
        _id,
        status: 'active',
        game: battle.game,
        tournament_name: match.name,
        prize: [
            {
                _id: new mongoose.Types.ObjectId(),
                key: "Entry Fee",
                value: match.entry_fee
            },
            {
                _id: new mongoose.Types.ObjectId(),
                key: "Prize Pool",
                value: match.winning_amount
            }
        ],
        rank: [
            {
                _id: new mongoose.Types.ObjectId(),
                rank: 1,
                amount: match.winning_amount
            }
        ],
        size: 2,
        registration_opening: Date.now(),
        registration_closing: null,
        tournament_start_time: null,
        created_by: userId
    });

    const chatRoomId = new mongoose.Types.ObjectId();
    const chatRoom = new ChatRoom({
        _id: chatRoomId,
        messages: [
            {
                text: "Let's play ",
                created_by: mongoose.Types.ObjectId('5e8b820063a73d0017b149da')
            },
            {
                text: "You will be notified once you have a opponent",
                created_by: mongoose.Types.ObjectId('5e8b820063a73d0017b149da')
            },
            {
                text: "Chat with your opponent, then fix the game timing and play the match",
                created_by: mongoose.Types.ObjectId('5e8b820063a73d0017b149da')
            },
            {
                text: "After match completed. Upload screenshot of scrorecard. Once scorecard is verified your amount will be transferred to your wallet.",
                created_by: mongoose.Types.ObjectId('5e8b820063a73d0017b149da')
            }
        ]
    });
    await chatRoom.save();

    tournament
        .save()
        .then(() => {
            req.tournamentId = _id;
            const battleQueueId = new mongoose.Types.ObjectId();
            const battleQueueEntry = new BattleQueue({
                _id: battleQueueId,
                match: match._id,
                chat_room: chatRoom,
                battle: battle._id,
                tournament: _id,
                created_by: userId
            });

            battleQueueEntry
                .save()
                .then((entry) => {
                    req.battleQueueEntry = entry;
                    next();
                    return;
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

exports.get_battle_queue = async (req, res) => {
    const battleEntryQueueId = req.battleQueueEntry._id;

    try {
        const battleEntry = await BattleQueue
            .findById(battleEntryQueueId)
            .populate('match')
            .populate({
                path: 'match',
                populate: {
                    path: 'battle'
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'platform'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'participents',
                    populate: {
                        path: 'user',
                        select: 'name profile_image'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'game_meta.lookup_type',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'instructions',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'guide',
                    }
                }
            })
            .exec();

        const roomId = battleEntry.chat_room;
        WEB.globalIo.in(roomId).emit('battleQueueUpdate', battleEntry);

        try {
            if (req.tournamentNotCreated) {
                const loggedInUserId = req.userData.userId;
                Notify.notify_chat_room(roomId, loggedInUserId, "We got match !!! Let's Play")
            }
        } catch (err) {
            console.log(err);
        }

        return res.status(201).json({
            success: true,
            response: battleEntry
        })

    } catch (err) {
        return res.status(201).json({
            success: false,
            response: 'get battle queue error'
        })
    }
}

exports.upload_scrorecard = async (req, res, next) => {
    const battleEntryQueueId = req.params.id;
    const link = req.body.link;
    const userId = req.userData.userId;

    try {
        await BattleQueue.update({ _id: battleEntryQueueId }, {
            $set: {
                scorecard: {
                    image_link: link,
                    created_by: userId
                }
            }
        }).exec();

        return res.status(201).json({
            success: true,
        })
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.mark_complete = async (req, res) => {
    const battleEntryQueueId = req.params.id;

    try {
        await BattleQueue.update({ _id: battleEntryQueueId }, {
            $set: {
                completed: true
            }
        }).exec();

        return res.status(201).json({
            success: true,
        })
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.get = async (req, res) => {
    const battleEntryQueueId = req.params.id;

    try {
        const battleEntry = await BattleQueue
            .findById(battleEntryQueueId)
            .populate('match')
            .populate({
                path: 'match',
                populate: {
                    path: 'battle'
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'platform'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'participents',
                    populate: {
                        path: 'user',
                        select: 'name profile_image'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'game_meta.lookup_type',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'instructions',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'guide',
                    }
                }
            })
            .exec();

        return res.status(201).json({
            success: true,
            response: battleEntry
        })

    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.get_all_completed_battle_queue = async (req, res) => {
    const query = { deleted_at: { $eq: null }, completed: { $eq: true } };

    try {
        const battleEntry = await BattleQueue
            .find(query)
            .populate('match')
            .populate({
                path: 'match',
                populate: {
                    path: 'battle'
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'platform'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'participents',
                    populate: {
                        path: 'user',
                        select: 'name profile_image'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'game_meta.lookup_type',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'instructions',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'guide',
                    }
                }
            })
            .exec();

        return res.status(201).json({
            success: true,
            response: battleEntry
        })

    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.get_joined_battle_queue = async (req, res) => {
    const userId = req.userData.userId;
    const battleId = req.params.id;

    const query = { deleted_at: { $eq: null } };

    if (battleId) {
        query['battle'] = battleId;
    }

    try {
        const battleEntry = await BattleQueue
            .find(query)
            .populate('match')
            .populate({
                path: 'match',
                populate: {
                    path: 'battle'
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'platform'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'participents',
                    populate: {
                        path: 'user',
                        select: 'name profile_image'
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'game_meta.lookup_type',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'instructions',
                    }
                }
            })
            .populate({
                path: 'tournament',
                populate: {
                    path: 'game',
                    populate: {
                        path: 'guide',
                    }
                }
            })
            .exec();
        const filerData = battleEntry.filter(entry => {
            const participents = entry.tournament.participents || [];
            let got = false;

            participents.forEach((item = {}) => {
                const userEntry = item.user || {};
                const userEntryId = userEntry._id;
                if (userId == userEntryId) {
                    got = true;
                }
            })

            return got;
        })

        return res.status(201).json({
            success: true,
            response: filerData
        })

    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        })
    }
}

exports.mark_battle_queue_as_full = async (req, res, next) => {
    const battleQueueEntry = req.battleQueueEntry || {};
    const id = battleQueueEntry._id;

    if (req.tournamentNotCreated) {
        try {
            await BattleQueue.findByIdAndUpdate(id, { $set: { full: true } }).exec()
        } catch (err) {
            console.log('err', err);
        }
    }

    next();
}
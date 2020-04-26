
const moment = require('moment');
const mongoose = require('mongoose');
const Tournament = require('../models/tournament.model');
const RemoveUnUsedJob = require('./remove-unused-match');
const Battle = require('../models/battle.model');
const Participent = require('../models/participent.model');
const Notify = require('../controllers/notify.controller');

const GAMEPLEX_USER_ID = '5e8b820063a73d0017b149da';
const GAME_ID = '5e9e08ce7060761dc9d78c18';
const BATTLE_ID = '5e9e09d80935141e48d854ef';

async function create_tournament_flappy_bird(tournamentName, entryFee, duration) {
    const min_size = 2;
    const winningAmount = (entryFee * min_size) * (9 / 10);

    const _id = new mongoose.Types.ObjectId();
    const tournament = new Tournament({
        _id,
        status: 'active',
        game: GAME_ID,
        private: true,
        tournament_name: tournamentName,
        prize: [
            {
                _id: new mongoose.Types.ObjectId(),
                key: "Entry Fee",
                value: entryFee
            },
            {
                _id: new mongoose.Types.ObjectId(),
                key: "Win Amount",
                value: winningAmount
            }
        ],
        rank: [
            {
                _id: new mongoose.Types.ObjectId(),
                rank: 1,
                amount: winningAmount
            }
        ],
        size: 10,
        min_size: 2,
        registration_opening: moment().toDate(),
        registration_closing: moment().add(duration, 'hours').toDate(),
        tournament_start_time: moment().toDate(),
        tournament_end_time: moment().add(duration, 'hours').toDate(),
        created_by: GAMEPLEX_USER_ID
    });

    tournament.save();
    await Battle.findByIdAndUpdate(BATTLE_ID, {
        $push: {
            tournament_list: _id
        }
    }).exec();
}

exports.create_all_flappy_bird_tournament = async () => {
    await Battle.findByIdAndUpdate(BATTLE_ID, {
        $set: {
            tournament_list: []
        }
    });

    create_tournament_flappy_bird("Hopping Freeway", 0, 10);
    create_tournament_flappy_bird("Hopping Silver", 5, 10);
    create_tournament_flappy_bird("Hopping Gold", 10, 10);
    create_tournament_flappy_bird("Hopping Platinum", 25, 10);
    create_tournament_flappy_bird("Hopping Diamond", 50, 10);
}

exports.complete_tournament = async () => {
    await Battle.findByIdAndUpdate(BATTLE_ID, {
        $set: {
            tournament_list: []
        }
    });


    const tournaments = await Tournament.find({
        game: GAME_ID,
        created_by: GAMEPLEX_USER_ID,
        private: true,
        tournament_end_time: {
            $lt: moment().toDate()
        }
    }).select('_id').exec();

    tournaments.forEach(async (tournament) => {
        const tournamentId = tournament._id;

        const tournamentObject = await Tournament
            .findById(tournamentId)
            .populate({
                path: 'participents',
                populate: {
                    path: 'user',
                    select: '_id firebase_token'
                }
            })
            .exec();
        const tournamentObjectParticipents = tournamentObject.participents || [];

        if (tournament.payout_released) {
            return;
        }

        if (tournamentObjectParticipents.length < 2) {
            for (let j = 0; j < tournamentObjectParticipents.length; j++) {
                const participent = tournamentObjectParticipents[j];
                await RemoveUnUsedJob.RefundParticipationAmount(participent);
            }
            NotifyAboutAmountRefund(tournamentObjectParticipents, tournamentObject);
        } else {
            // relese payout and complete tournament
            const rankWiseParticipent = tournamentObjectParticipents.sort((a = {}, b = {}) => {
                // a should come before b in the sorted order
                if (a.result_meta.score < b.result_meta.score) {
                    return 1;
                    // a should come after b in the sorted order
                } else if (a.result_meta.score > b.result_meta.score) {
                    return -1;
                    // a and b are the same
                } else {
                    return 0;
                }
            });

            NotifyAmountMatchComplete(rankWiseParticipent, tournamentObject);

            //set ranking
            for (let i = 0; i < rankWiseParticipent.length; i++) {
                const item = rankWiseParticipent[i];

                await Participent.findByIdAndUpdate(item._id, { $set: { 'rank_meta.rank': i + 1 } });
            }

            //release payout
            const rankWiseAmount = {};

            tournamentObject.rank.forEach((rankItem) => {
                rankWiseAmount[rankItem.rank] = rankItem.amount;
            })


            rankWiseParticipent.forEach(async (item = {}) => {
                const resultMeta = item.result_meta || {};
                const rank = resultMeta.rank;
                const userId = item.user._id;
                let winAmount = 0;

                if (rank) {
                    winAmount += rankWiseAmount[rank] || 0;
                }

                if (winAmount > 0) {
                    const walletTransaction = {
                        amount: Math.abs(winAmount),
                        target: "win_balance",
                        source: tournamentId,
                        source_name: "Tournament"
                    };

                    await User.findByIdAndUpdate(userId, {
                        $inc: {
                            wallet_win_balance: Number(Math.abs(winAmount))
                        },
                        $push: {
                            wallet_transactions: walletTransaction
                        }
                    }).exec();
                }
            })
        }

        await Tournament.findByIdAndUpdate(tournamentId, {
            $set: {
                status: "completed",
                ranking_set: true,
                payout_released: true
            }
        }).exec();
    })

}


async function NotifyAboutAmountRefund(participents = [], tournament = {}) {
    const tournamentName = tournament.tournament_name;
    const tokens = participents.map((participent) => participent.user.firebase_token);

    Notify.notify(tokens, {
        title: "Amount Refuned",
        body: tournamentName + " was cancelled. your amount is refuned to your wallet."
    })
}

async function NotifyAmountMatchComplete(participents = [], tournament = {}) {
    const tournamentName = tournament.tournament_name;
    const tokens = participents.map((participent) => participent.user.firebase_token);

    Notify.notify(tokens, {
        title: "Tournament Completed",
        body: tournamentName + " is complted. check your tournament rank now!!!",
        data: { route: "Tournament", value: tournament._id }
    })
}
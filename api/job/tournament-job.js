
const moment = require('moment');
const mongoose = require('mongoose');
const Tournament = require('../models/tournament.model');
const RemoveUnUsedJob = require('./remove-unused-match');
const Battle = require('../models/battle.model');

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
    await Battle.findByIdAndUpdate(BATTLE_ID).update({
        $push: {
            tournament_list: _id
        }
    }).exec();
}

exports.create_all_flappy_bird_tournament = async () => {
    await Battle.findByIdAndUpdate(BATTLE_ID).update({
        $set: {
            tournament_list: []
        }
    });

    create_tournament_flappy_bird("Hopping Freeway", 0, 12);
    create_tournament_flappy_bird("Hopping Silver", 5, 12);
    create_tournament_flappy_bird("Hopping Gold", 10, 12);
    create_tournament_flappy_bird("Hopping Platinum", 25, 12);
    create_tournament_flappy_bird("Hopping Diamond", 50, 12);
}

exports.complete_tournament = async () => {
    await Battle.findByIdAndUpdate(BATTLE_ID).update({
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

        if (tournamentObjectParticipents.length < 2) {
            for (let j = 0; j < tournamentObjectParticipents.length; j++) {
                const participent = tournamentObjectParticipents[j];
                await RemoveUnUsedJob.RefundParticipationAmount(participent);
            }
            NotifyAboutAmountRefund(participents, tournament);

            await tournament.update({ _id: tournament.id }, {
                $set: {
                    status: "completed",
                    ranking_set: true,
                    payout_released: true
                }
            })
        }
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
const moment = require('moment');

const BattleQueue = require('../models/battle-queue.model');
const User = require('../models/user.model');
const Participent = require('../models/participent.model');

//Utils
const Notify = require('../controllers/notify.controller');
const Email = require('../../utils/send-email');

exports.get_daily_report = async function () {
    const nowDate = moment().toDate();
    const yesterdayDate = moment().subtract('4', 'day').toDate();

    const users = await User
        .find({
            created_at: {
                $gt: yesterdayDate,
                $lt: nowDate
            }
        })
        .select('-_id name email mobile dob')
        .exec();

    let message = 'Daily User Signup Report!!! \n\n\n';

    users.forEach((user = {}, index) => {
        message += `\n ${index + 1}.\t\t\t${user.name}\t\t\t\t\t${user.email}\t\t\t\t\t${user.mobile}\t\t\t\t\t${moment(user.dob).format('DD MMM YYYY')}`
    })
    console.log('message', message);
    // Email.send_email("hkxicor@gmail.com", "Daily Report", message);

    Notify.notify('');
}

exports.remove_unused_match = async function () {
    const yesterdayDate = moment().subtract('1', 'day').toDate();

    const battleQueue = await BattleQueue
        .find({
            completed: false,
            payout_released: false,
            // 'scorecard.image_link': {
            //     $eq: null
            // },
            created_at: {
                $lt: yesterdayDate
            }
        })
        .populate({
            path: 'tournament',
            populate: {
                path: 'participents',
                populate: {
                    path: 'user',
                    select: '_id firebase_token'
                }
            }
        }).exec();

    for (let i = 0; i < battleQueue.length; i++) {
        const entry = battleQueue[i] || {};
        const tournament = entry.tournament || {};
        const participents = tournament.participents || {};

        for (let j = 0; j < participents.length; j++) {
            const participent = participents[j];
            await RefundParticipationAmount(participent);
        }
        NotifyUserThatRoomIsDeleted(participents, tournament);

        //complete 
        await BattleQueue.update({ _id: entry._id }, {
            $set: {
                completed: true,
                payout_released: true
            }
        }).exec();

        await tournament.update({ _id: tournament.id }, {
            $set: {
                status: "completed",
                ranking_set: true,
                payout_released: true
            }
        })
    }
}

// function Refund Partifipation Amount
async function RefundParticipationAmount(participent) {
    const id = participent._id;
    const userId = participent.user._id;
    const amount = participent.wallet_transaction.amount;
    const target = participent.wallet_transaction.amount;

    await Participent.findByIdAndUpdate(id, {
        deleted_at: Date.now()
    });

    if (amount == 0) {
        return true;
    }

    //REFUND LOGIC

    const walletTransaction = {
        amount: amount,
        target: target,
    };


    await User.findByIdAndUpdate(userId, {
        $inc: {
            wallet_cash_balance: amount
        },
        $push: {
            wallet_transactions: walletTransaction
        }
    }).exec();

    return true;
}

async function NotifyUserThatRoomIsDeleted(participents = [], tournament = {}) {
    const tournamentName = tournament.tournament_name;
    const tokens = participents.map((participent) => participent.user.firebase_token);

    Notify.notify(tokens, {
        title: "Unused room removed",
        body: tournamentName + " battle room is removed as it was inactive for last 24 hours. Joining fee is refunded to wallet."
    })
}

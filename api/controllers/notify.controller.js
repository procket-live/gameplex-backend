const FCM = require('fcm-node');
const mongoose = require('mongoose');
const fcm = new FCM(process.env.FIREBASE_SERVER_KEY);
const User = require('../models/user.model');
const ChatRoom = require('../models/chat-room.model');
const BattleQueue = require('../models/battle-queue.model');
const Tournament = require('../models/tournament.model');

function notify(tokens, { title, body, data }, collapseKey = '') {
    var message = {
        registration_ids: tokens,
        collapse_key: collapseKey,

        notification: {
            title: title,
            body: body
        },

        data: data
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

exports.notify_to_users = async (userIds = [], { title, body, data }) => {
    const users = await User
        .find({
            '_id': {
                $in: userIds.map((id) => mongoose.Types.ObjectId(id))
            }
        })
        .select('firebase_token -_id')
        .exec();

    const tokens = users.map((user) => user.firebase_token);

    notify(tokens, { title, body, data });
}

exports.notify_to_tournament_participents = async (tournamentId, expect = []) => {
    let tournament = await Tournament
        .findById(tournamentId)
        .select('-_id tournament_name participents')
        .populate({
            path: 'participents',
            populate: {
                path: 'user',
                select: '-_id firebase_token'
            },
            select: '-_id user'
        }).exec();

    tournament = tournament || {};

    const participents = tournament.participents || [];
    const tokens = participents
        .map((participent = {}) => {
            const user = participent.user || {};
            return user.firebase_token;
        })

    console.log('tokens', tokens)

    notify(tokens, {
        title: "Tournament Rool Id and Password Set",
        body: "Room and password is set. your tournament is about to start. Get Ready!!!",
        data: { route: "Tournament", value: tournamentId }
    });
}

exports.notify_chat_room = async (roomId, senderId, message) => {
    const battleQueue = await BattleQueue
        .find({ chat_room: roomId })
        .select('tournament')
        .populate({
            path: 'tournament',
            populate: {
                path: 'participents',
                populate: {
                    path: 'user',
                    select: '_id name firebase_token'
                },
                select: '_id user'
            },
            select: '-_id participents'
        })
        .exec();

    if (!battleQueue.length) {
        return;
    }

    try {
        const battleQueueEntry = battleQueue[0];
        const participents = battleQueueEntry.tournament.participents.filter((participent) => participent.user._id != senderId);
        const tokens = participents.map((participent) => participent.user.firebase_token);
        const sender = battleQueueEntry.tournament.participents.filter((participent) => participent.user._id == senderId)[0];
        const senderName = sender.user.name;
        notify(tokens, { title: senderName, body: message, data: { route: "BattleQueue", value: battleQueueEntry._id } }, senderId);
    } catch (err) {
        console.log(err);
    }
}
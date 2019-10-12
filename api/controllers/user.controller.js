const mongoose = require('mongoose');

const User = require('../models/user.model');

exports.get_user = (req, res, next) => {
    User.find({})
        .exec()
        .then((users) => {
            return res.status(201).json({
                success: true,
                response: users
            })
        }).catch((err) => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
};
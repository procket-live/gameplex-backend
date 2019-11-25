const mongoose = require('mongoose');

const LookupType = require('../models/lookup-type.model');

exports.create = (req, res) => {
    const userId = req.userId;

    const newLookupType = new LookupType({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        created_at: new Date(),
        values: [],
        created_by: userId,
        updated_at: new Date()
    })

    newLookupType
        .save()
        .then((result) => {
            res.status(201).json({
                success: true,
                response: result,
            })
        })
        .catch((err) => {
            res.status(201).json({
                success: true,
                response: err
            })
        })
};

exports.add_value = (req, res) => {
    const userId = req.userId;

    const lookupTypeId = req.params.id;

    const newLookupValue = {
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        value: req.body.value,
        created_at: new Date(),
        created_by: userId,
        updated_at: new Date()
    };

    LookupType
        .update({ _id: lookupTypeId }, { $push: { values: newLookupValue } })
        .exec()
        .then((result) => {
            res.status(201).json({
                success: true,
                response: result,
            })
        })
        .catch((err) => {
            res.status(201).json({
                success: false,
                response: err
            })
        })
}

exports.get = (req, res) => {
    LookupType
        .find({})
        .exec()
        .then((result) => {
            res.status(201).json({
                success: true,
                response: result
            })
        })
        .catch((err) => {
            res.status(201).json({
                success: false,
                response: err
            })
        })
}

exports.get_single = (req, res) => {
    LookupType
        .findOne({ _id: req.params.id })
        .exec()
        .then((result) => {
            res.status(201).json({
                success: true,
                response: result
            })
        })
        .catch((err) => {
            res.status(201).json({
                success: false,
                response: err
            })
        })
}

const mongoose = require('mongoose');

const Game = require('../models/game.model');

exports.get_all = (req, res) => {
  Game
    .find(req.query)
    .populate("platform", '-_id name icon')
    .select("name thumbnail wallpaper platform")
    .exec()
    .then((results) => {
      res.status(201).json({
        success: true,
        response: results
      })
    })
    .catch((err) => {
      res.status(201).json({
        success: true,
        response: err
      })
    })
}

exports.get = (req, res) => {
  Game
    .findOne({ _id: req.params.id })
    .populate('game_meta.lookup_type')
    .exec()
    .then((result) => {
      res.status(201).json({
        success: true,
        response: result
      })
    })
    .catch((err) => {
      res.status(201).json({
        success: true,
        response: err
      })
    })
}

exports.add = (req, res) => {
  const newGame = Game({
    _id: new mongoose.Types.ObjectId(),
    active: true,
    name: req.body.name,
    description: req.body.description,
    thumbnail: req.body.thumbnail,
    wallpaper: req.body.wallpaper,
    platform: req.body.platform,
    game_meta: [],
    price_meta: [],
    created_at: new Date(),
    update_at: new Date(),
    created_by: req.userId
  });

  newGame
    .save()
    .then(() => {
      res.status(201).json({
        success: true,
        response: 'game added'
      })
    })
    .catch((err) => {
      res.status(201).json({
        success: true,
        response: err
      })
    })
}

exports.edit = (req, res) => {
  const update = { $push: {} };

  if (req.body.game_meta) {
    update['$push'] = {
      "game_meta": req.body.game_meta
    }
  }

  if (req.body.price_meta) {
    update['$push'] = {
      "price_meta": req.body.price_meta
    }
  }

  Game
    .update({ _id: req.params.id }, update)
    .exec()
    .then(() => {
      res.status(201).json({
        success: true,
        response: 'game updated'
      })
    })
    .catch((err) => {
      res.status(201).json({
        success: true,
        response: err
      })
    })
}
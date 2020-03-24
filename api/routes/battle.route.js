const express = require('express');
const router = express.Router();

const Battle = require('../controllers/battle.controller');
const Tournament = require('../controllers/tournament.controller');

router.get('/', Battle.get_all);
router.post('/:id', Battle.attach_match, Battle.is_enough_wallet_amount, Battle.find_queue_entry, Battle.create_tournament_for_match, Tournament.is_alredy_joined, Tournament.join_tournament, Tournament.get);

module.exports = router;
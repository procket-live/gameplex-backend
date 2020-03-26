const express = require('express');
const router = express.Router();

const Battle = require('../controllers/battle.controller');
const Tournament = require('../controllers/tournament.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', Battle.get_all);
router.post('/join/:id', checkAuth, Battle.attach_match, Battle.is_enough_wallet_amount, Battle.find_queue_entry, Battle.create_tournament_for_match, Tournament.is_alredy_joined, Tournament.join_tournament, Battle.get_battle_queue);
router.get('/join/:id', checkAuth, Battle.get_joined_battle_queue);

module.exports = router;
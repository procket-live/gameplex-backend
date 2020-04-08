const express = require('express');
const router = express.Router();

const Battle = require('../controllers/battle.controller');
const Tournament = require('../controllers/tournament.controller');
const checkAuth = require('../middlewares/check-auth');
const checkOrganizer = require('../middlewares/check-organizer');

router.get('/', Battle.get_all);
router.get('/all-joined', checkAuth, checkOrganizer, Battle.get_all_completed_battle_queue);
router.get('/join', checkAuth, Battle.get_joined_battle_queue);
router.post('/join/:id', checkAuth, Battle.attach_match, Battle.is_enough_wallet_amount, Battle.find_queue_entry, Battle.create_tournament_for_match, Tournament.is_alredy_joined, Tournament.join_tournament, Battle.mark_battle_queue_as_full, Battle.get_battle_queue);
router.get('/join/:id', checkAuth, Battle.get_joined_battle_queue);
router.get('/payout/:id', checkAuth, checkOrganizer, Battle.make_payout_released)
router.get('/:id', checkAuth, Battle.get);
router.post('/:id/scorecard', checkAuth, Battle.upload_scrorecard);
router.post('/:id/completed', checkAuth, Battle.mark_complete);

module.exports = router;
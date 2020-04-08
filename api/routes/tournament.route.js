const express = require('express');
const router = express.Router();

const TournamentController = require('../controllers/tournament.controller');
const checkAuth = require('../middlewares/check-auth');
const checkOrganizer = require('../middlewares/check-organizer');

router.get('/', checkAuth, TournamentController.get_all);
router.get('/upcoming', checkAuth, TournamentController.get_upcoming);
router.get('/upcomingActive', checkAuth, TournamentController.get_upcoming_active);
router.get('/my', checkAuth, TournamentController.get_my_tournaments);
router.post('/join/:id', checkAuth, TournamentController.is_alredy_joined, TournamentController.join_tournament);
router.post('/ranking/:id', checkAuth, TournamentController.set_ranking);
router.get('/:id/participents', checkAuth, TournamentController.get_participents);
router.get('/:id/rollout-payment', checkAuth, checkOrganizer, TournamentController.rollout_payment);
router.get('/:id', checkAuth, TournamentController.get);
router.post('/', checkAuth, TournamentController.add);
router.put('/:id', checkAuth, TournamentController.edit);

module.exports = router;
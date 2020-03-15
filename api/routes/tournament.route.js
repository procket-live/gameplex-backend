const express = require('express');
const router = express.Router();

const TournamentController = require('../controllers/tournament.controller');
const UserController = require('../controllers/user.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', checkAuth, TournamentController.get_all);
router.get('/upcoming', checkAuth, TournamentController.get_upcoming);
// router.get('/upcoming/:id', checkAuth, TournamentController.get_upcoming);
router.get('/upcomingActive', checkAuth, TournamentController.get_upcoming_active);
router.get('/:id', checkAuth, TournamentController.get);
router.post('/', checkAuth, TournamentController.add);
router.put('/:id', checkAuth, TournamentController.edit);
router.post('/join/:id', checkAuth, TournamentController.is_alredy_joined, TournamentController.join_tournament);
router.get('/:id/participents', checkAuth, TournamentController.get_participents);
router.post('/ranking/:id', checkAuth, TournamentController.set_ranking);

module.exports = router;
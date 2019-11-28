const express = require('express');
const router = express.Router();

const TournamentController = require('../controllers/tournament.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', checkAuth, TournamentController.get_all);
router.get('/upcoming', checkAuth, TournamentController.get_upcoming);
router.get('/:id', checkAuth, TournamentController.get);
router.post('/', checkAuth, TournamentController.add);
router.put('/:id', checkAuth, TournamentController.edit);

module.exports = router;
const express = require('express');
const router = express.Router();

const TournamentController = require('../controllers/tournament.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', TournamentController.get_all);
router.get('/:id', TournamentController.get);
router.post('/', TournamentController.add);
router.put('/:id', TournamentController.edit);

module.exports = router;
const express = require('express');
const router = express.Router();

const GameController = require('../controllers/game.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', GameController.get_all);
router.get('/:id', checkAuth, GameController.get);
router.post('/', checkAuth, GameController.add);
router.put('/:id', checkAuth, GameController.edit)

module.exports = router;
const express = require('express');
const router = express.Router();

const Battle = require('../controllers/battle.controller');

router.get('/', Battle.get_all);

module.exports = router;
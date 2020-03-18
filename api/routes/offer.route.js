const express = require('express');
const router = express.Router();

const checkAuth = require('../middlewares/check-auth');
const Offer = require('../controllers/offer.controller');

router.get('/', checkAuth, Offer.get_all);

module.exports = router;
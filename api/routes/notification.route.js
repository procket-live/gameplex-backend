const express = require('express');
const router = express.Router();

const checkAuth = require('../middlewares/check-auth');
const Notification = require('../controllers/notification.controller');

router.get('/', checkAuth, Notification.get_all);

module.exports = router;
const express = require('express');
const router = express.Router();

const DashboardController = require('../controllers/dashboard.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', checkAuth, DashboardController.get_dashboard_meta);

module.exports = router;
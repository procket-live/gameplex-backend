const express = require('express');
const router = express.Router();

const OrganizerController = require('../controllers/organizer.controller');
const DashboardController = require('../controllers/dashboard.controller');
const checkAuth = require('../middlewares/check-auth');
const checkOrganizer = require('../middlewares/check-organizer');

router.get('/', checkAuth, checkOrganizer, OrganizerController.get_organizer_profile, DashboardController.get_dashboard_meta);
router.post('/', checkAuth, checkOrganizer, OrganizerController.create_organizer_profile);
router.put('/', checkAuth, checkOrganizer, OrganizerController.update_organizer_profile);

module.exports = router;
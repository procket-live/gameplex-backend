const express = require('express');
const router = express.Router();

const getAppController = require('../controllers/getApp.controller');
const AppReleaseController = require('../controllers/release.controller');

router.get('/', getAppController.get_app);
router.get('/latest', AppReleaseController.get_latest);

module.exports = router;
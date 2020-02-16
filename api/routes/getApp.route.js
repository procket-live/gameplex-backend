const express = require('express');
const router = express.Router();

const getAppController = require('../controllers/getApp.controller');

router.get('/', getAppController.get_app);

module.exports = router;
const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', UserController.get_user);
router.post('/generate-otp', UserController.generate_otp);
// router.post('/verify-otp', UserController.verify_otp);

module.exports = router;
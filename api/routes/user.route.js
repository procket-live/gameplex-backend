const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');
const checkAuth = require('../middlewares/check-auth');

// router.get('/', UserController.get_user);
// router.post('/generate-otp', UserController.generate_otp);
// router.post('/verify-otp', UserController.verify_otp);

router.get('/', checkAuth, UserController.get_user);
router.put('/', checkAuth, UserController.update_user);
// router.post('/truecaller', UserController.create_user_if_not_exist, UserController.truecaller_login);
router.post('/generate-otp', UserController.create_user_if_not_exist, UserController.generate_otp);
router.post('/verify-otp', UserController.verify_otp);
router.get('/ganerate-email-otp', checkAuth, UserController.generate_email_otp);
router.post('/verify-email-otp', checkAuth, UserController.verify_email_otp);
router.get('/resend-otp/:id', UserController.resend_otp);
// router.get('/find', checkAuth, UserController.find_user);

module.exports = router;
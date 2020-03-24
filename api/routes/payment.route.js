const express = require('express');
const router = express.Router();

const checkAuth = require('../middlewares/check-auth');
const OrderController = require('../controllers/order.controller');
const UserController = require('../controllers/user.controller');
const PaymentController = require('../controllers/payment.controller');

router.post('/initiate', checkAuth, PaymentController.generate_order);
router.post('/validate', checkAuth, PaymentController.validate_payment, UserController.update_wallet_balance);
router.get('/transactions', checkAuth, OrderController.get_transactions);
// router.post('/webhook')

module.exports = router;
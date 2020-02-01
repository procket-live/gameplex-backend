const express = require('express');
const router = express.Router();

const checkAuth = require('../middlewares/check-auth');
const OrderController = require('../controllers/order.controller');
const UserController = require('../controllers/user.controller');
const PaymentController = require('../controllers/payment.controller');

// router.post('/', checkAuth, GameController.get_all);
router.post('/initiate', checkAuth, OrderController.is_paid, OrderController.create_order);
router.post('/validate', checkAuth, OrderController.update_order_status);
router.get('/transactions', checkAuth, OrderController.get_transactions);

module.exports = router;
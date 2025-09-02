const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');


// Create order
router.post('/create-order', paymentController.createOrder);

// Verify payment
router.post('/verify-payment', paymentController.verifyPayment);

// Refund payment
router.post('/refund', paymentController.refundPayment);

// Fetch payment details
router.get('/payment/:payment_id', paymentController.getPaymentDetails);

// Fetch refund details
router.get('/refund/:refund_id', paymentController.getRefundDetails);

module.exports = router;

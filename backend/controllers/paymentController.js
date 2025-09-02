const razorpay = require('../config/razorpay'); 
const crypto = require('crypto');
const UserPayment = require('../models/UserPayment');

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency, userId } = req.body;

        const options = {
            amount: amount * 100, // in paisa
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        const paymentRecord = new UserPayment({
            userId,
            orderId: order.id,
            amount,
            currency,
            status: 'created'
        });

        await paymentRecord.save();
        res.status(200).json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Order creation failed' });
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

        console.log("Incoming body:", req.body);
        console.log("Using secret:", `"${process.env.RAZORPAY_KEY_SECRET}"`);

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        console.log("String for HMAC:", body);

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET.trim())
            .update(body)
            .digest('hex');

        console.log("Expected Signature:", expectedSignature);
        console.log("Received Signature:", razorpay_signature);

        let status = 'failed';
        if (expectedSignature === razorpay_signature) {
            status = 'paid';
        }

        console.log("Final Status:", status);

        await UserPayment.findOneAndUpdate(
            { userId, orderId: razorpay_order_id },
            { paymentId: razorpay_payment_id, status }
        );

        res.status(200).json({ status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};



// Refund Payment
exports.refundPayment = async (req, res) => {
    try {
        const { paymentId, amount, userId, description } = req.body;

        if (!paymentId) return res.status(400).json({ message: 'Payment ID required' });

        const refundOptions = {};
        if (amount) refundOptions.amount = amount * 100;
        refundOptions.notes = { reason: description, refunded_by: userId };

        const refund = await razorpay.payments.refund(paymentId, refundOptions);

        await UserPayment.findOneAndUpdate(
            { userId, paymentId },
            { status: 'refunded', notes: { ...refundOptions.notes } }
        );

        res.status(200).json({ message: 'Refund successful', refund });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Refund failed', error: error.message });
    }
};

// Fetch Payment Details
exports.getPaymentDetails = async (req, res) => {
    try {
        const payment = await razorpay.payments.fetch(req.params.payment_id);
        res.status(200).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fetch payment failed' });
    }
};

// Fetch Refund Details
exports.getRefundDetails = async (req, res) => {
    try {
        const refund = await razorpay.refunds.fetch(req.params.refund_id);
        res.status(200).json(refund);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fetch refund failed' });
    }
};

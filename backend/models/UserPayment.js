const mongoose = require('mongoose');

const userPaymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed', 'refunded'],
        default: 'created'
    },
    notes: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model('UserPayment', userPaymentSchema);

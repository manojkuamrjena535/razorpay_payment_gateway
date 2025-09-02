const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RCek95cdSqMMP2',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'JZp4x4iaSw3U8AF0o7JUGTa0'
});

module.exports = razorpayInstance;
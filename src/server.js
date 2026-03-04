const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/create-order', async (req, res) => {
  const { amount, device_id } = req.body;
  const order = await razorpay.orders.create({
    amount: amount * 100, // convert to paise
    currency: 'INR',
    receipt: `receipt_${device_id}`,
    notes: { device_id }
  });
  res.json(order);
});

app.listen(5000, () => console.log('Server running on port 5000'));
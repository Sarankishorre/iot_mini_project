import React from 'react';
import axios from 'axios';

const PaymentButton = ({ deviceId, amount, planName }) => {

  const handlePayment = async () => {
    try {
      // 1. Create order from backend
      const { data: order } = await axios.post('http://localhost:5000/create-order', {
        amount,
        device_id: deviceId,
      });

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'IoT Hub',
        description: `Activate ${deviceId} — ${planName}`,
        order_id: order.id,
        handler: function (response) {
          alert(`✅ Device Activated!\nPayment ID: ${response.razorpay_payment_id}`);
        },
        prefill: { name: 'IoT User', email: 'user@example.com' },
        theme: { color: '#00e5a0' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert('❌ Payment failed. Make sure backend server is running.');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl transition"
    >
      ⚡ Activate Device — ₹{amount}
    </button>
  );
};

export default PaymentButton;

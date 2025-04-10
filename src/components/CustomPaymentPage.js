import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const CustomPaymentPage = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    email: '',
    amount: '',
    recipientName: 'Zain Saeed'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create Checkout Session
      const { data } = await axios.post('http://localhost:5000/api/create-checkout-session', {
        email: paymentDetails.email,
        amount: parseFloat(paymentDetails.amount),
        recipientName: paymentDetails.recipientName
      });

      // Load Stripe
      const stripe = await loadStripe(data.publishableKey);

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        console.error('Checkout failed', error);
      }
    } catch (error) {
      console.error('Payment initiation failed', error);
    }
  };

  // Success Page Component
  const SuccessPage = () => {
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
      const fetchPaymentDetails = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        try {
          const { data } = await axios.get(`http://localhost:5000/api/checkout-session/${sessionId}`);
          setPaymentDetails(data);
        } catch (error) {
          console.error('Failed to fetch payment details', error);
        }
      };

      fetchPaymentDetails();
    }, []);

    if (!paymentDetails) return <div>Loading...</div>;

    return (
      <div>
        <h1>Payment Successful!</h1>
        <p>Amount: ${paymentDetails.amount}</p>
        <p>Email: {paymentDetails.customer_email}</p>
        <p>Status: {paymentDetails.status}</p>
      </div>
    );
  };

  return (
    <div className="payment-container">
      <form onSubmit={handleSubmit}>
        <h2>Complete Payment</h2>
        <input
          type="email"
          value={paymentDetails.email}
          onChange={(e) => setPaymentDetails(prev => ({
            ...prev, 
            email: e.target.value
          }))}
          placeholder="Your Email"
          required
        />
        <input
          type="number"
          value={paymentDetails.amount}
          onChange={(e) => setPaymentDetails(prev => ({
            ...prev, 
            amount: e.target.value
          }))}
          placeholder="Amount"
          required
        />
        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
};

// CSS Styles
const styles = `
.payment-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
  font-family: 'Arial', sans-serif;
}

.payment-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.transaction-header {
  background-color: #f8f9fa;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.transaction-details {
  margin-top: 15px;
}

.payment-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.form-row {
  display: flex;
  justify-content: space-between;
}

.form-row .form-group {
  width: 30%;
}

.pay-button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pay-button:hover {
  background-color: #45a049;
}

.secure-note {
  text-align: center;
  margin-top: 15px;
  color: #6c757d;
  font-size: 0.9em;
}
`;

// Inject styles
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

export default CustomPaymentPage;
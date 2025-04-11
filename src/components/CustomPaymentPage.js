import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

import { 
    FaCreditCard, 
    FaCheckCircle, 
    FaEnvelope, 
    FaMapMarkerAlt, 
    FaUser, 
    FaDollarSign 
} from 'react-icons/fa';

// Load Stripe outside of component to avoid CustomPaymentForm  on every render
const stripePromise = loadStripe('pk_test_51Qk7O5AGEAsU6cwJd0gZkfTHG5PjtPTas19Ybgn24HA5wo4m0B5tOM0bAPRyDJPzALGgcGSwHw1eVxmFb6MWuC0O00tlJGZmNV');

// Success Page Component
const SuccessPage = ({ paymentDetails }) => {
    return (
      <div className="success-container">
        <div className="success-card">
          <FaCheckCircle className="success-icon" />
          <h2>Payment Successful!</h2>
          <div className="success-details">
            <p>
              <FaDollarSign /> Amount Paid: 
              <span>${paymentDetails.amount}</span>
            </p>
            <p>
              <FaUser /> Name: 
              <span>{paymentDetails.name}</span>
            </p>
            <p>
              <FaEnvelope /> Email: 
              <span>{paymentDetails.email}</span>
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="back-button"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
};

  
const CustomPaymentForm = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    email: '',
    amount: '',
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Use Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setPaymentDetails(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setPaymentDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
  
    setProcessing(true);
    setError(null);
  
    try {
      // Create Payment Method
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: paymentDetails.name,
          email: paymentDetails.email,
          address: {
            line1: paymentDetails.address.street,
            city: paymentDetails.address.city,
            state: paymentDetails.address.state,
            postal_code: paymentDetails.address.zipCode
          }
        }
      });
  
      if (error) {
        throw error;
      }
  
      // Send payment to backend
      const response = await axios.post('http://localhost:5000/api/process-payment', {
        paymentMethodId: paymentMethod.id,
        amount: parseFloat(paymentDetails.amount),
        currency: 'usd',
        description: 'Custom Payment',
        metadata: {
          email: paymentDetails.email,
          name: paymentDetails.name
        }
      });
  
      // Handle successful payment
      if (response.data.success) {
        setPaymentSuccess(true);
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // If payment is successful, show success page
  if (paymentSuccess) {
    return <SuccessPage paymentDetails={paymentDetails} />;
  }

  return (
    <div className="custom-payment-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-header">
          <h2>Complete Your Payment</h2>
          <p>Secure payment with YourCompany</p>
        </div>

        {/* Email */}
        <div className="form-group">
          <label><FaEnvelope /> Email Address</label>
          <input
            type="email"
            name="email"
            value={paymentDetails.email}
            onChange={handleInputChange}
            placeholder="Your email"
            required
          />
        </div>

        {/* Amount */}
        <div className="form-group">
          <label><FaDollarSign /> Payment Amount</label>
          <input
            type="number"
            name="amount"
            value={paymentDetails.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            step="0.01"
            required
          />
        </div>

        {/* Card Details */}
        <div className="form-group">
          <label><FaCreditCard /> Card Details</label>
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        {/* Name */}
        <div className="form-group">
          <label><FaUser /> Cardholder Name</label>
          <input
            type="text"
            name="name"
            value={paymentDetails.name}
            onChange={handleInputChange}
            placeholder="Name on Card"
            required
          />
        </div>

        {/* Billing Address */}
        <div className="form-group">
          <label><FaMapMarkerAlt /> Street Address</label>
          <input
            type="text"
            name="address.street"
            value={paymentDetails.address.street}
            onChange={handleInputChange}
            placeholder="Street Address"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="address.city"
              value={paymentDetails.address.city}
              onChange={handleInputChange}
              placeholder="City"
              required
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="address.state"
              value={paymentDetails.address.state}
              onChange={handleInputChange}
              placeholder="State"
              required
            />
          </div>
          <div className="form-group">
            <label>ZIP Code</label>
            <input
              type="text"
              name="address.zipCode"
              value={paymentDetails.address.zipCode}
              onChange={handleInputChange}
              placeholder="ZIP Code"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-button" 
          disabled={processing || !stripe}
        >
          {processing ? 'Processing...' : `Pay $${paymentDetails.amount || '0.00'}`}
        </button>

        {/* Error Display */}
        {error && (
          <div className="error-message">{error}</div>
        )}
      </form>
    </div>
  );
};


// Wrap with Stripe Elements
const CustomPaymentPage = () => (
  <Elements stripe={stripePromise}>
    <CustomPaymentForm />
  </Elements>
);

export default CustomPaymentPage;
// CSS Styles
const styles = `
:root {
  --primary-color: #4a90e2;
  --secondary-color: #4CAF50;
  --background-color: #ffffff;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--background-color);
}

.custom-payment-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.payment-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.5s ease;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.form-header p {
  color: #6c757d;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #333;
  font-weight: 500;
}

.form-group label svg {
  margin-right: 10px;
  color: var(--primary-color);
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74,144,226,0.2);
}

.form-row {
  display: flex;
  justify-content: space-between;
}

.form-row .form-group {
  width: 30%;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: bold;
}

.submit-button:hover {
  background-color: #45a049;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #d9534f;
  text-align: center;
  margin-top: 15px;
}

/* Success Page Styles */
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
}

.success-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.success-icon {
  color: var(--secondary-color);
  font-size: 80px;
  margin-bottom: 20px;
}

.success-details {
  margin: 20px 0;
  text-align: left;
}

.success-details p {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  color: #333;
}

.success-details p svg {
  margin-right: 10px;
  color: var(--primary-color);
}

.back-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #3a7bd5;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

// Inject styles
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)
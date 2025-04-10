import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe('pk_test_51Qk7O5AGEAsU6cwJd0gZkfTHG5PjtPTas19Ybgn24HA5wo4m0B5tOM0bAPRyDJPzALGgcGSwHw1eVxmFb6MWuC0O00tlJGZmNV');

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
        alert('Payment Successful!');
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

  // Dummy data fill function
  const fillDummyData = () => {
    setPaymentDetails({
      email: 'test@example.com',
      amount: '100.00',
      name: 'John Doe',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '12345'
      }
    });
  };

  // Test card fill function
  const fillTestCard = () => {
    // Use Stripe test card
    const cardElement = elements.getElement(CardElement);
    cardElement.clear(); // Clear any existing input
    cardElement.update({
      value: '4242424242424242' // Successful Stripe test card
    });
  };

  return (
    <div className="custom-payment-container">
      <div className="test-buttons">
        <button type="button" onClick={fillDummyData}>
          Fill Dummy Data
        </button>
        <button type="button" onClick={fillTestCard}>
          Fill Test Card
        </button>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <h2>Complete Your Payment</h2>

        {/* Email */}
        <div className="form-group">
          <label>Email Address</label>
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
          <label>Payment Amount</label>
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
          <label>Card Details</label>
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
          <label>Cardholder Name</label>
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
          <label>Street Address</label>
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

// CSS Styles (can be in a separate file)
const styles = `
.custom-payment-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
  font-family: 'Arial', sans-serif;
}

.payment-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  padding: 30px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error {
  color: red;
  font-size: 0.8em;
  margin-top: 5px;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 15px;
}
`;

// Inject styles
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)
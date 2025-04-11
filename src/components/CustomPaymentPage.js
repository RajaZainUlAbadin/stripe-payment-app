import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; 
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
const stripePromise = loadStripe('pk_live_51QtPeBBaKYkjIBKfMHvCM1TpZfvfHnhOnsD3XRN5MInJHpDdqsiXCQcje6xudpVAWNyiAYE81MUIzCvvECNO7BSX00CB3W9qUm');

// Success Page Component
const SuccessPage = ({ paymentDetails, amount, productTitle }) => {
  return (
    <div className="payment-layout">
      <div className="success-container">
        <div className="success-card">
          <FaCheckCircle className="success-icon" />
          <h2>Payment Successful!</h2>
          <div className="success-details">
            <p>
              <span>Product:</span>
              <span>{productTitle}</span>
            </p>
            <p>
              <span>Amount Paid:</span>
              <span>USD ${amount}</span>
            </p>
            <p>
              <span>Email:</span>
              <span>{paymentDetails.email}</span>
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="back-button"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};



const CustomPaymentForm = ({ productTitle, amount })  => {
  const [paymentDetails, setPaymentDetails] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
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

  const validateCardNumber = (value) => {
    // Remove spaces and non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    // Add space after every 4 digits
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  };
  
  const validateExpiry = (value) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
  
    setProcessing(true);
    setError(null);
  
    try {
      const card = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
          name: `${paymentDetails.firstName} ${paymentDetails.lastName}`.trim(),
          email: paymentDetails.email,
          address: {
            line1: paymentDetails.address,
            city: paymentDetails.city,
            postal_code: paymentDetails.postalCode,
            country: paymentDetails.country,
          }
        }
      });

  
      if (error) {
        throw error;
      }
  
      // Send payment to backend
      const response = await axios.post('http://localhost:5000/api/process-payment', {
        paymentMethodId: paymentMethod.id,
        amount: parseFloat(amount.replace(/,/g, '')),
        currency: 'usd',
        description: productTitle,
        metadata: {
          email: paymentDetails.email,
          name: `${paymentDetails.firstName} ${paymentDetails.lastName}`.trim()
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

  const countries = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brazil' },
  ];


  return (
    <div className="payment-layout">
      <form onSubmit={handleSubmit}>
        <div className="payment-form-container">
          <h2>Contact</h2>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={paymentDetails.email}
              onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
              placeholder="Email"
              required
            />
          </div>

          <h2>Payment</h2>
          <div className="payment-security-note">
            All transactions are secure and encrypted.
          </div>

          <div className="credit-card-section">
            <div className="payment-method-header">
              <input type="radio" checked readOnly />
              <span>Credit card</span>
              <div className="card-icons">
                <img src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/visa.sxIq5Dot.svg" alt="Visa" />
                <img src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/mastercard.1c4_lyMp.svg" alt="Mastercard" />
                <img src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/discover.C7UbFpNb.svg" alt="Discover" />
                <img src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/amex.Csr7hRoy.svg" alt="Amex" />
                <span className="more-cards">+4</span>
              </div>
            </div>

            <div className="card-element-container">
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
          </div>

          <h2>Billing address</h2>
          
          <div className="country-select">
            <select 
              name="country"
              value={paymentDetails.country}
              onChange={(e) => setPaymentDetails({...paymentDetails, country: e.target.value})}
              required
            >
              <option value="">Country/Region</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="name-fields">
            <input
              type="text"
              placeholder="First name (optional)"
              value={paymentDetails.firstName}
              onChange={(e) => setPaymentDetails({...paymentDetails, firstName: e.target.value})}
            />
            <input
              type="text"
              placeholder="Last name"
              value={paymentDetails.lastName}
              onChange={(e) => setPaymentDetails({...paymentDetails, lastName: e.target.value})}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Address"
            value={paymentDetails.address}
            onChange={(e) => setPaymentDetails({...paymentDetails, address: e.target.value})}
            required
          />

          <div className="postal-city-row">
            <input
              type="text"
              placeholder="Postal code (optional)"
              value={paymentDetails.postalCode}
              onChange={(e) => setPaymentDetails({...paymentDetails, postalCode: e.target.value})}
            />
            <input
              type="text"
              placeholder="City"
              value={paymentDetails.city}
              onChange={(e) => setPaymentDetails({...paymentDetails, city: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit" 
            className="pay-now-button"
            disabled={processing || !stripe}
          >
            {processing ? 'Processing...' : `Pay $${amount}`}
          </button>

          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

      </form>
      
      <div className="order-summary">
        <div className="product-summary">
          <div className="product-image">
            <img src="https://cdn.shopify.com/s/files/1/0701/3934/7201/files/VisaNet_36367f1e-416e-478c-87f9-62bf51239594_64x64.jpg?v=1716476840"/>
          </div>
          <div className="product-info">
            <span className="product-title">{productTitle}</span>
            <span className="product-price">${amount}</span>
          </div>
        </div>
        <div className="total-section">
          <div className="total-row">
            <span>Total</span>
            <span className="total-amount">USD ${amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with Stripe Elements
const CustomPaymentPage = () => {
  const location = useLocation();
  const { productTitle, amount } = location.state || {};

  return(
    <Elements stripe={stripePromise}>
      <CustomPaymentForm productTitle={productTitle} amount={amount} />
    </Elements>
  );
};

export default CustomPaymentPage;
const styles = `
.payment-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 40px;
  padding: 20px;
}

.payment-form-container {
  flex: 1;
  max-width: 650px;
}

.order-summary {
  width: 350px;
  background: #f7f7f7;
  padding: 20px;
  border-radius: 4px;
}

.product-summary {
  display: flex;
  gap: 15px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.product-image {
  width: 50px;
  height: 50px;
  background: #fff;
  border-radius: 4px;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.total-section {
  padding-top: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 15px;
}

.card-row {
  display: flex;
  gap: 15px;
}

.payment-method-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.card-icons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pay-now-button {
  width: 100%;
  padding: 15px;
  background: #0047cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.name-fields, .city-state {
  display: flex;
  gap: 15px;
}

.payment-security-note {
  color: #666;
  margin-bottom: 15px;
}

.license-required {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}

.error-message {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 12px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}

.card-input-fields input.error {
  border-color: #ff4d4f;
}

.pay-now-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}


.billing-section {
  margin-top: 30px;
}

.billing-section h2 {
  font-size: 16px;
  margin-bottom: 15px;
}

.country-select select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 15px;
  background-color: white;
  cursor: pointer;
}

.name-row {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.name-row input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.full-width {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 15px;
}

.postal-city-row {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.postal-city-row input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* Optional: Add focus styles */
input:focus, select:focus {
  outline: none;
  border-color: #0047cc;
  box-shadow: 0 0 0 1px rgba(0,71,204,0.1);
}

/* Optional: Add hover styles */
input:hover, select:hover {
  border-color: #999;
}


.card-element-container {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  margin-bottom: 15px;
}

.card-element-container.StripeElement--focus {
  border-color: #0047cc;
  box-shadow: 0 0 0 1px rgba(0,71,204,0.1);
}

.card-element-container.StripeElement--invalid {
  border-color: #ff4d4f;
}
`;

// Add the styles to your document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
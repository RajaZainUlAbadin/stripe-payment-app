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
  // Remove commas and convert to number
  const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '') : amount;
    
  // Format the amount
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parseFloat(cleanAmount));

  console.log('Original amount:', amount); // For debugging
  console.log('Formatted amount:', formattedAmount); // For debugging

  return (
    <div className="success-layout">
      <div className="success-container">
        <div className="success-header">
          <FaCheckCircle className="success-icon" />
          <h1>Payment successful</h1>
          <p className="success-subtitle">Thank you for your purchase</p>
        </div>

        <div className="receipt-container">
          <div className="receipt-section">
            <h3>Amount paid</h3>
            <div className="amount-row">
              <span className="large-amount">USD ${formattedAmount}</span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Summary</h3>
            <div className="summary-row">
              <span>Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="summary-row">
              <span>Product</span>
              <span>{productTitle}</span>
            </div>
            <div className="summary-row">
              <span>Payment method</span>
              <span>Credit Card</span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Receipt details</h3>
            <div className="summary-row">
              <span>Email</span>
              <span>{paymentDetails.email}</span>
            </div>
            <div className="summary-row">
              <span>Name</span>
              <span>{`${paymentDetails.firstName} ${paymentDetails.lastName}`}</span>
            </div>
            <div className="summary-row">
              <span>Address</span>
              <span>{`${paymentDetails.address}, ${paymentDetails.city}, ${paymentDetails.country}`}</span>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button 
            onClick={() => window.location.href = '/'}
            className="back-button"
          >
            Return to Home
          </button>
          <button 
            onClick={() => window.print()}
            className="print-button"
          >
            Print receipt
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

  const [modalContent, setModalContent] = useState({
    isOpen: false,
    title: '',
    content: ''
  });

  const openModal = (title, content) => {
    setModalContent({
      isOpen: true,
      title,
      content
    });
  };

  const closeModal = () => {
    setModalContent({
      isOpen: false,
      title: '',
      content: ''
    });
  };

  // Add this before the return statement
  const modalContents = {
    refund: `
      <h3>Returns and Refunds</h3>
      <p>Here at Clinkpagamentosvisanet.com, we want to ensure you're completely satisfied with your purchase. If for any reason you're not happy with the received product, we offer a flexible return policy.</p>
  
      <h4>Return Period</h4>
      <p>You have up to 30 days from the date of receipt to request a return.</p>
  
      <h4>Return Conditions</h4>
      <ul>
        <li>The product must be in its original packaging, with no signs of use.</li>
        <li>The product must not show any damage or alterations.</li>
        <li>Personalized or custom-made items may not be eligible for return unless there is a manufacturing defect.</li>
      </ul>
  
      <h4>Return Process</h4>
      <ul>
        <li>Contact us through our customer service channel (email or phone).</li>
        <li>Inform the reason for return and the order number.</li>
        <li>We will send detailed instructions on how to proceed with the return.</li>
      </ul>
  
      <h4>Refund</h4>
      <p>Once we receive the returned product and verify its condition, we will process the refund. The amount will be credited to the same payment method used in the original purchase.</p>
  
      <h4>Contact</h4>
      <p>Email: canalbm4@gmail.com<br>
      Phone: +5511944748373</p>
    `,
  
    shipping: `
      <h3>Shipping Times and Costs</h3>
      <p>At Clinkpagamentosvisanet.com, we care about offering a transparent and efficient shopping experience for our customers.</p>
  
      <h4>Order Processing Times</h4>
      <ul>
        <li>Order processing usually takes 1 to 2 business days.</li>
        <li>After processing, delivery time varies according to the chosen shipping option.</li>
      </ul>
  
      <h4>Shipping Options</h4>
      <p>Standard Shipping:</p>
      <ul>
        <li>Delivery time: 5 to 7 business days.</li>
        <li>Cost: $10.00.</li>
      </ul>
      
      <p>Express Shipping:</p>
      <ul>
        <li>Delivery time: 2 to 3 business days.</li>
        <li>Cost: $20.00.</li>
      </ul>
  
      <h4>Contact</h4>
      <p>Email: canalbm4@gmail.com<br>
      Phone: +5511944748373</p>
    `,
  
    privacy: `
      <h3>Personal Data Collection and Use</h3>
      <p>At Clinkpagamentosvisanet.com, we take our customers' privacy seriously. This policy describes how we collect, use, and protect the personal data of our website visitors and customers.</p>
  
      <h4>Information Collected</h4>
      <ul>
        <li>We collect information such as name, address, email, and phone number when you make a purchase or subscribe to our newsletter.</li>
        <li>We also collect browsing information, such as IP address, cookies, and site usage data.</li>
      </ul>
  
      <h4>Use of Information</h4>
      <ul>
        <li>We use personal data to process orders, send product updates, and improve customer experience.</li>
        <li>We don't share your information with third parties, except when necessary to process transactions or comply with legal obligations.</li>
      </ul>
  
      <h4>Contact</h4>
      <p>Email: canalbm4@gmail.com<br>
      Phone: +5511944748373</p>
    `,
  
    terms: `
      <h3>Website Usage</h3>
      <p>By accessing and using the visanet website, you agree to the following terms and conditions:</p>
  
      <h4>Intellectual Property</h4>
      <ul>
        <li>All website content, including texts, images, logos, and design, is the exclusive property of [Store Name].</li>
        <li>You may not copy, reproduce, or distribute any content without authorization.</li>
      </ul>
  
      <h4>Responsible Use</h4>
      <ul>
        <li>You agree to use the website responsibly and legally.</li>
        <li>Do not send offensive, illegal, or harmful content.</li>
      </ul>
  
      <h4>Contact</h4>
      <p>Email: canalbm4@gmail.com<br>
      Phone: +5511944748373</p>
    `,
  
    legal: `
      <h3>Website Usage</h3>
      <p>By accessing and using the clinkpagamentosvisanet.com website, you agree to the following terms and conditions:</p>
  
      <h4>Intellectual Property</h4>
      <ul>
        <li>All website content, including texts, images, logos, and design, is the exclusive property of [Store Name].</li>
        <li>You may not copy, reproduce, or distribute any content without authorization.</li>
      </ul>
  
      <h4>Contact</h4>
      <p>Email: canalbm4@gmail.com<br>
      Phone: +5511944748373</p>
    `,
  
    contact: `
      <h3>Contact Information</h3>
      
      <h4>Email</h4>
      <p>Email: canalbm4@gmail.com</p>
  
      <h4>Phone</h4>
      <p>Phone: +5511944748373</p>
  
      <h4>Address</h4>
      <p>Address: RUE ST. PIERRE 18, FRIBOURG, 1700 SWITZERLAND</p>
    `
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
      const response = await axios.post('https://www.clinkpayvisanet.com:5000/api/process-payment', {
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
    return <SuccessPage paymentDetails={paymentDetails} amount={amount.toString()}  productTitle={productTitle}  />;
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
    { code: 'BN', name: 'Brunei' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'Congo, Democratic Republic' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'Korea, North' },
    { code: 'KR', name: 'Korea, South' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MK', name: 'Macedonia' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'MX', name: 'Mexico' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'São Tomé and Príncipe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SZ', name: 'Swaziland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SY', name: 'Syria' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
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


          <div className="footer-links">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              openModal("Returns and Refunds", modalContents.refund);
            }}>Return Policy</a>
            
            <a href="#" onClick={(e) => {
              e.preventDefault();
              openModal("Shipping Policy", modalContents.shipping);
            }}>Shipping Policy</a>
            
            <a href="#" onClick={(e) => {
              e.preventDefault();
              openModal("Privacy Policy", modalContents.privacy);
            }}>Privacy Policy</a>
            
            <a href="#" onClick={(e) => {
              e.preventDefault();
              openModal("Terms of Service", modalContents.terms);
            }}>Terms of Service</a>
            
            <a href="#" onClick={(e) => {
              e.preventDefault();
              openModal("Legal Notice", modalContents.legal);
            }}>Legal Notice</a>
            
            <a href="#" onClick={(e) => {
              e.preventDefault();
              openModal("Contact Information", modalContents.contact);
            }}>Contact Information</a>
          </div>
          

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

      <Modal 
        isOpen={modalContent.isOpen}
        onClose={closeModal}
        title={modalContent.title}
      >
         <div dangerouslySetInnerHTML={{ __html: modalContent.content }} />
      </Modal>
    </div>
  );
};

// Wrap with Stripe Elements
const CustomPaymentPage = () => {
  const location = useLocation();
  const { productTitle, amount } = location.state || {};

  return(
    <>
      <div className="header">
        <img 
          src="https://cdn.shopify.com/s/files/1/0701/3934/7201/files/Visa-desenvolve-servico-com-deep-learning-para-aprovar-ou-negar-transacoes-com-cartao_2000x.webp" 
          alt="Header Background" 
          className="header-background"
        />
        <div className="header-logo">
          <img 
            src="https://cdn.shopify.com/s/files/1/0701/3934/7201/files/fullsize_2011_08_30_15_WDL-Logo-5264_9731_041106734_145508065_4_x320.jpg?v=1731286004" 
            alt="Logo"
          />
        </div>
      </div>
      <Elements stripe={stripePromise}>
        <CustomPaymentForm productTitle={productTitle} amount={amount} />
      </Elements>
    </>
  );
};


const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{title}</h2>
        {children}
      </div>
    </div>
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
  justify-content: center; /* Add this line to center the content horizontally */
  align-items: flex-start; /* Add this to align items to the top */
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


.footer-links {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.footer-links a {
  color: #000;
  text-decoration: none;
  margin-right: 15px;
  font-size: 14px;
}

.footer-links a:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-content h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.modal-content h4 {
  font-size: 18px;
  margin: 20px 0 10px;
  color: #444;
}

.modal-content p {
  margin: 10px 0;
  line-height: 1.6;
  color: #666;
}

.modal-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.modal-content li {
  margin: 5px 0;
  color: #666;
  line-height: 1.4;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
}


.header {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  margin-bottom: 30px;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.header-logo {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 80px;
  height: 80px;
  z-index: 2;
  background: white;
  border-radius: 4px;
  padding: 5px;
}

.header-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}



.success-layout {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

.success-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.success-header {
  text-align: center;
  padding: 40px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.success-icon {
  color: #0047cc;
  font-size: 48px;
  margin-bottom: 16px;
}

.success-header h1 {
  margin: 0;
  font-size: 24px;
  color: #1a1f36;
  font-weight: 600;
}

.success-subtitle {
  color: #697386;
  margin: 8px 0 0;
  font-size: 16px;
}

.receipt-container {
  padding: 24px;
}

.receipt-section {
  margin-bottom: 32px;
}

.receipt-section h3 {
  color: #1a1f36;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
}

.amount-row {
  background: #f7fafc;
  padding: 16px;
  border-radius: 4px;
  text-align: center;
}

.large-amount {
  font-size: 32px;
  font-weight: 600;
  color: #1a1f36;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  color: #1a1f36;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row span:first-child {
  color: #697386;
}

.success-actions {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.back-button, .print-button {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.back-button {
  background: #0047cc;
  color: white;
  border: none;
}

.print-button {
  background: white;
  color: #0047cc;
  border: 1px solid #0047cc;
}

@media print {
  .success-actions {
    display: none;
  }
  
  .success-layout {
    margin: 0;
    padding: 0;
    box-shadow: none;
  }
}
`;

// Add the styles to your document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
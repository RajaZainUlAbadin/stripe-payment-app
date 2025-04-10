require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());

// Process Payment
app.post('/api/process-payment', async (req, res) => {
  const { 
    paymentMethodId, 
    amount, 
    currency = 'usd', 
    description = 'Payment',
    metadata 
  } = req.body;

  try {
    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      description,
      metadata,
      
      // Optional: Customize payment
      payment_method_options: {
        card: {
          request_three_d_secure: 'any'
        }
      }
    });

    // Handle different payment intent statuses
    switch (paymentIntent.status) {
      case 'succeeded':
        return res.json({ 
          success: true, 
          paymentIntent: paymentIntent 
        });
      
      case 'requires_action':
        return res.json({
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret
        });
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Payment failed' 
        });
    }
  } catch (error) {
    console.error('Payment Processing Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
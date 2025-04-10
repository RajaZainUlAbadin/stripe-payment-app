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
    // Create Payment Intent with advanced configuration
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      
      // Add these configuration options
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      
      // Add return and cancel URLs
      return_url: process.env.FRONTEND_URL + '/success',
      
      confirm: true,
      description,
      metadata,
    });

    // Handle different payment intent statuses
    return res.json({ 
      success: true, 
      paymentIntent: paymentIntent 
    });
  } catch (error) {
    console.error('Payment Processing Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.raw // Include more detailed error info
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
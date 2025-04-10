require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  const { 
    amount, 
    recipientName, 
    recipientId, // Optional Stripe Connect account
    email 
  } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Payment to ${recipientName}`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer_email: email,
      
      // Optional: Connect Transfer
      payment_intent_data: recipientId ? {
        transfer_data: {
          destination: recipientId
        }
      } : undefined,

      metadata: {
        recipientName,
        recipientId
      }
    });

    res.json({ 
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Verify Payment Status
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    res.json({
      status: session.payment_status,
      amount: session.amount_total / 100,
      customer_email: session.customer_email
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve session',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
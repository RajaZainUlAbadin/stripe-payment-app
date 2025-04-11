import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CustomPaymentPage from './components/CustomPaymentPage';
import HomePage from './components/HomePage';

// Load the Stripe library with your publishable key
const stripePromise = loadStripe('pk_test_51Qk7O5AGEAsU6cwJd0gZkfTHG5PjtPTas19Ybgn24HA5wo4m0B5tOM0bAPRyDJPzALGgcGSwHw1eVxmFb6MWuC0O00tlJGZmNV');

function App() {
  return (
    <Elements stripe={stripePromise}>
      <div className="App">
        <HomePage />;
      </div>
    </Elements>
  );
}

export default App;
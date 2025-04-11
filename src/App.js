import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CustomPaymentPage from './components/CustomPaymentPage';


// Load the Stripe library with your publishable key
const stripePromise = loadStripe('pk_test_51Qk7O5AGEAsU6cwJd0gZkfTHG5PjtPTas19Ybgn24HA5wo4m0B5tOM0bAPRyDJPzALGgcGSwHw1eVxmFb6MWuC0O00tlJGZmNV');

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/payment" element={<CustomPaymentPage />} />
    </Routes>
  );
}

export default App;
# Sample Custom Stripe Payment Integration

## Stripe API Keys Configuration

### 1. Stripe Account Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create a free account
3. Navigate to Developers > API Keys

### 2. Backend Configuration (.env file)

I have added the .env in the backend directory, so change directory to backend first via `` cd ./backend `` then just update the
.env file with your Stripe Keys from the step 1

```env
# Stripe Secret Key (NEVER share this publicly)
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key

# Stripe Publishable Key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Backend Port
PORT=5000
```

### 3. Frontend Configuration (Stripe Key)
Open `` src/components/CustomPaymentPage.js `` on Visual Studio Code and on `` line 21 `` you can see this line of code
`` const stripePromise = loadStripe('<UPDATE THIS WITH PUBLISHABLE STRIPE KEY>'); ``. Go ahead and replace the parameter value of `` loadStripe `` to your own publishable stripe key.


## Frontend Setup
`` npm install `` then
`` npm start ``

## Backend Setup
Create another terminal then in that terminal do `` cd ./backend `` then 
`` npm install `` then
`` npm run dev ``
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
`` npm run dev ``. This `` npm run dev `` will only have an error if and only if you don't have nodemon package installed in your local in which you can do via this command `` npm install -g nodemon `` or the port 5000 is already running in that case you have to kill the port 5000 first before running this.


## Stripe Test Card Numbers
``` 
Card Type	Number	Behavior
Always Succeeds	4242 4242 4242 4242	Immediate success
Requires Auth	4000 0025 0000 3155	Needs additional verification
Declined	4000 0000 0000 0002	Always fails
```


## Frontend Customization
You can change the company name to your own company name from this page `` src/components/CustomPaymentPage.js `` `` (line 167) ``. Just change
'YourCompany' to 'Your Own Company Sample Name'. You can also even add a logo beside it using ``<img>`` tag.



## Final Note
After the customer have successfully entered his/her payment information and the payment was success as indicated in the page after clicking Pay button, the payment transaction will be automatically be reflected in your Stripe account transaction in this link https://dashboard.stripe.com/test/payments as status 'Succeeded'.
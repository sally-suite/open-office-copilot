import { STRIPE_SECRET_KEY } from '@/constants/stripe';
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2023-08-16'
});

export default stripe;
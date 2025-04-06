export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";


export const PUBLISHABLE_KEY = process.env.VERCEL_ENV == 'development'
    ? "pk_test_51NfDlTGQLlND4d8GTxcOggpwjtSDNPCbuBkxH49uE4vQYnGnfpMv5GlyajpFWq9xIYp1jxreCXYgjCpo3CUnjkD100HHezTNrc"
    : "pk_live_51NfDlTGQLlND4d8GaOkkdImTC7ZhLr9CZuq4viYCxukjO5cdsf3IBW35WIDpWnQq3p95GUhKM8QSuq6wCKtQGi5m00bnPqwliX";


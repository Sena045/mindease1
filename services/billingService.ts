export interface Product {
  productId: string;
  title: string;
  price: string;
  currency: string;
  description: string;
  subscriptionPeriod: string;
}

const PRODUCTS: Product[] = [
  {
    productId: 'mindease_premium_monthly',
    title: 'Monthly Premium',
    price: '₹500',
    currency: 'INR',
    description: 'Unlimited access for one month',
    subscriptionPeriod: 'P1M'
  },
  {
    productId: 'mindease_premium_yearly',
    title: 'Yearly Premium',
    price: '₹5,000',
    currency: 'INR',
    description: 'Unlimited access for one year',
    subscriptionPeriod: 'P1Y'
  }
];

/**
 * ⚠️ IMPORTANT: CURRENTLY IN MOCK MODE
 * 
 * To receive real money, you must:
 * 1. Wrap this app using Capacitor (npx cap add android).
 * 2. Install the plugin: npm install @capacitor-community/billing
 * 3. Configure these exact Product IDs in Google Play Console.
 */

export const getProducts = async (): Promise<Product[]> => {
  // TODO: REAL IMPLEMENTATION EXAMPLE
  // import { GooglePlayBilling } from '@capacitor-community/google-play-billing';
  // await GooglePlayBilling.connect();
  // const result = await GooglePlayBilling.querySkuDetails({ skus: ['mindease_premium_monthly', 'mindease_premium_yearly'] });
  // return result.value;

  // MOCK IMPLEMENTATION
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PRODUCTS);
    }, 600);
  });
};

export const requestPurchase = async (productId: string): Promise<boolean> => {
  console.info(`%c[Billing Service] Requesting purchase: ${productId}`, "color: #0d9488; font-weight: bold;");
  
  // TODO: REAL IMPLEMENTATION EXAMPLE
  // try {
  //   const response = await GooglePlayBilling.launchBillingFlow({ sku: productId });
  //   // Verify purchase token with your backend server here!
  //   return response.responseCode === 0; 
  // } catch (e) { return false; }

  // MOCK IMPLEMENTATION
  return new Promise((resolve) => {
    // Simulate user interaction with Google Play bottom sheet
    setTimeout(() => {
      console.info(`%c[Billing Service] Transaction Successful: ${productId}`, "color: #16a34a; font-weight: bold;");
      resolve(true);
    }, 2000);
  });
};
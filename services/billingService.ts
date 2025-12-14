import { Capacitor } from '@capacitor/core';

export interface Product {
  productId: string;
  title: string;
  price: string;
  currency: string;
  description: string;
  subscriptionPeriod: string;
}

// --- TYPE DEFINITIONS FOR CORDOVA-PLUGIN-PURCHASE ---
declare global {
  interface Window {
    CdvPurchase?: {
      store: {
        register: (config: any[]) => void;
        initialize: (options?: any) => void;
        get: (id: string) => any;
        requestPayment: (product: any) => any;
        restore: () => any; // Added restore method
        when: () => { 
          approved: (cb: (t: any) => void) => void;
          updated: (cb: (p: any) => void) => void;
        };
        off: (callback: any) => void;
        update: () => void;
        refresh: () => void;
        ready: (cb: () => void) => void;
        verbosity: any;
      };
      ProductType: {
        PAID_SUBSCRIPTION: string;
      };
      Platform: {
        GOOGLE_PLAY: string;
      };
      LogLevel: {
        INFO: any;
        DEBUG: any;
      }
    };
  }
}

// --- CONFIGURATION ---
// CRITICAL: Set to FALSE for the .aab file you upload to Google Play.
// If TRUE, Google will reject the app for bypassing real payments.
const USE_MOCK_BILLING = false;

// --- MOCK DATA (Fallback) ---
const MOCK_PRODUCTS: Product[] = [
  {
    productId: 'mindease_premium_monthly',
    title: 'Monthly Premium (Test)',
    price: '₹500',
    currency: 'INR',
    description: 'Unlimited access for one month',
    subscriptionPeriod: 'P1M'
  },
  {
    productId: 'mindease_premium_yearly',
    title: 'Yearly Premium (Test)',
    price: '₹5,000',
    currency: 'INR',
    description: 'Unlimited access for one year',
    subscriptionPeriod: 'P1Y'
  }
];

// CRITICAL: These IDs must match Google Play Console EXACTLY
const PRODUCT_IDS = ['mindease_premium_monthly', 'mindease_premium_yearly'];
let isStoreInitialized = false;

// --- INITIALIZE STORE ---
const initStore = () => {
  if (USE_MOCK_BILLING || isStoreInitialized || !window.CdvPurchase) return;

  const { store, ProductType, Platform } = window.CdvPurchase;
  
  // Set Verbosity to Info (Debug is too noisy for prod)
  store.verbosity = window.CdvPurchase.LogLevel.INFO;

  // Register products
  store.register(PRODUCT_IDS.map(id => ({
    id,
    type: ProductType.PAID_SUBSCRIPTION,
    platform: Platform.GOOGLE_PLAY,
  })));

  // Setup listeners
  store.when().approved((transaction: any) => {
    console.log('[Billing] ✅ Transaction approved:', transaction);
    transaction.verify(); 
  });
  
  store.initialize([Platform.GOOGLE_PLAY]);
  isStoreInitialized = true;
};

// --- GET PRODUCTS ---
export const getProducts = async (): Promise<Product[]> => {
  // 1. Force Mock Mode (If enabled or on Web)
  if (USE_MOCK_BILLING || !Capacitor.isNativePlatform() || !window.CdvPurchase) {
    if (USE_MOCK_BILLING) console.warn('[Billing] Mock Mode Active - Testing features enabled');
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 600));
  }

  // 2. Real Google Play Billing
  try {
    initStore();
    const { store } = window.CdvPurchase;

    console.log('[Billing] Updating store...');
    store.update();

    // Wait for store to sync (timeout after 2.5s)
    await new Promise(resolve => setTimeout(resolve, 2500));

    const products = PRODUCT_IDS.map(id => store.get(id)).filter(p => p && p.loaded && p.valid);
    
    if (products.length > 0) {
      return products.map((p: any) => ({
        productId: p.id,
        title: p.title || 'Premium Plan',
        price: p.offers?.[0]?.pricingPhases?.[0]?.price || '₹--',
        currency: p.offers?.[0]?.pricingPhases?.[0]?.currency || 'INR',
        description: p.description || '',
        subscriptionPeriod: 'Subscription'
      }));
    }
    
    return []; // Return empty if no products found (App should handle empty state gracefully)
    
  } catch (error) {
    console.error('[Billing] Failed to load products.', error);
    return [];
  }
};

// --- REQUEST PURCHASE ---
export const requestPurchase = async (productId: string): Promise<boolean> => {
  // 1. Force Mock Mode
  if (USE_MOCK_BILLING || !Capacitor.isNativePlatform() || !window.CdvPurchase) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  }

  // 2. Real Google Play Billing
  try {
    const { store } = window.CdvPurchase;
    const product = store.get(productId);
    
    if (!product || !product.valid) {
      alert("Product not found or invalid. Please check your internet connection.");
      return false;
    }

    const offer = product.getOffer();

    if (offer) {
      store.requestPayment(offer);
      return true; 
    } else {
      return false;
    }
  } catch (error) {
    console.error('[Billing] Purchase error.', error);
    return false;
  }
};

// --- RESTORE PURCHASES (REQUIRED BY GOOGLE) ---
export const restorePurchases = async (): Promise<boolean> => {
  if (USE_MOCK_BILLING || !Capacitor.isNativePlatform() || !window.CdvPurchase) {
     return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  try {
    const { store } = window.CdvPurchase;
    await store.restore();
    store.refresh();
    return true;
  } catch (e) {
    console.error("Restore failed", e);
    return false;
  }
};
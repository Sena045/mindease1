
export interface Product {
  productId: string;
  title: string;
  price: string;
  currency: string;
  description: string;
  subscriptionPeriod: string;
  amountInPaisa: number;
}

// --- CONFIGURATION ---
// TODO: Replace with your actual Razorpay Key ID from the Razorpay Dashboard (Settings > API Keys)
// Use 'rzp_test_...' for testing, and 'rzp_live_...' when you go live.
const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_HERE'; 

const PRODUCTS: Product[] = [
  {
    productId: 'relief_anchor_monthly',
    title: 'Monthly Premium',
    price: '₹500',
    currency: 'INR',
    description: 'Unlimited access for one month',
    subscriptionPeriod: 'Monthly',
    amountInPaisa: 50000 // 500 INR
  },
  {
    productId: 'relief_anchor_yearly',
    title: 'Yearly Premium',
    price: '₹4,500',
    currency: 'INR',
    description: 'Unlimited access for one year',
    subscriptionPeriod: 'Yearly',
    amountInPaisa: 450000 // 4500 INR
  }
];

export const getProducts = async (): Promise<Product[]> => {
  return PRODUCTS;
};

export const requestPurchase = async (productId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Cast window to any to avoid TypeScript errors if global type isn't picked up
    const win = window as any;
    
    if (typeof window === 'undefined' || !win.Razorpay) {
      alert("Razorpay SDK not loaded. Please check your internet connection.");
      resolve(false);
      return;
    }

    const product = PRODUCTS.find(p => p.productId === productId);
    if (!product) {
      alert("Product not found.");
      resolve(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID, 
      amount: product.amountInPaisa, 
      currency: "INR", 
      name: "ReliefAnchor",
      description: product.title,
      // Placeholder logo - replace with your actual URL hosted on your Netlify/Vercel public folder
      image: "https://via.placeholder.com/150/0f766e/ffffff?text=Anchor", 
      handler: function (response: any) {
        // Success Callback
        console.log("Payment Successful", response);
        // In a production app, you MUST verify the payment signature on your backend here.
        // For this MVP, we trust the client-side success callback.
        resolve(true);
      },
      prefill: {
        name: "ReliefAnchor User", 
        email: "user@example.com",
        contact: "" // Leave empty to let user fill
      },
      theme: {
        color: "#0f766e" // Match app brand color
      },
      modal: {
        ondismiss: function() {
          console.log("Payment Cancelled");
          resolve(false);
        }
      }
    };

    try {
      const rzp1 = new win.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        console.error("Payment Failed", response.error);
        alert(`Payment Failed: ${response.error.description}`);
        resolve(false);
      });
      rzp1.open();
    } catch (err) {
      console.error("Razorpay initialization failed", err);
      // Fallback for developer testing if Key ID is not set
      if (RAZORPAY_KEY_ID.includes('YOUR_KEY')) {
         const confirm = window.confirm("[DEVELOPER MODE] Razorpay Key ID not set. Simulate successful payment?");
         resolve(confirm);
      } else {
         resolve(false);
      }
    }
  });
};

export const restorePurchases = async (): Promise<boolean> => {
  // Since we don't have a backend database for this MVP, we check LocalStorage.
  // In a real app, you would call your API to check the user's subscription status.
  const hasLocal = localStorage.getItem('is_premium_user') === 'true';
  return hasLocal;
};
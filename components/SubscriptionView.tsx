
import React, { useState, useEffect } from 'react';
import { getProducts, requestPurchase, restorePurchases, Product } from '../services/billingService';
import { CurrencyCode, RegionCode } from '../types';
import { REGIONAL_PRICING, CURRENCY_RATES, CURRENCY_SYMBOLS, REGIONS } from '../constants';

interface SubscriptionViewProps {
  onSubscribe: () => void;
  isPremium: boolean;
  currency: CurrencyCode;
  region: RegionCode;
  onOpenLegal?: (type: 'privacy' | 'terms') => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onSubscribe, isPremium, currency, region, onOpenLegal }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      const items = await getProducts();
      setProducts(items);
    };
    loadProducts();
  }, []);

  const getPriceData = () => {
    const directRegion = REGIONS.find(r => r.currency === currency && r.code !== 'GLOBAL');
    if (directRegion && REGIONAL_PRICING[directRegion.code]) {
       return { data: REGIONAL_PRICING[directRegion.code], isDirect: true };
    }
    return { data: REGIONAL_PRICING['GLOBAL'], isDirect: false };
  };

  const { data: priceData, isDirect } = getPriceData();

  const getDisplayPrice = (amountStr: string) => {
    if (isDirect) return amountStr;
    const base = parseFloat(amountStr.replace(/,/g, ''));
    if (isNaN(base)) return amountStr;
    const rate = CURRENCY_RATES[currency] || 1;
    const converted = base * rate;
    return converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const displaySymbol = CURRENCY_SYMBOLS[currency] || '$';
  const displayMonthly = getDisplayPrice(priceData.monthly);
  const displayYearly = getDisplayPrice(priceData.yearly);

  const handleSubscribe = async (productId: string) => {
    setSelectedSku(productId);
    setLoading(true);
    
    try {
      // Razorpay handles the UI modal, so we wait for the promise to resolve
      const success = await requestPurchase(productId);
      
      if (success) {
        // Persist subscription details for accurate billing date calculation
        const type = productId.includes('yearly') ? 'yearly' : 'monthly';
        localStorage.setItem('subscription_type', type);
        localStorage.setItem('subscription_start_date', new Date().toISOString());

        onSubscribe();
        // Playful success alert
        alert(`🎉 Welcome to ReliefAnchor Premium!\n\nYour support helps us keep mental health accessible.`);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your internet.");
    } finally {
      setLoading(false);
      setSelectedSku(null);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const success = await restorePurchases();
    setLoading(false);
    if (success) {
      if (!localStorage.getItem('subscription_start_date')) {
         localStorage.setItem('subscription_start_date', new Date().toISOString());
         localStorage.setItem('subscription_type', 'monthly');
      }
      onSubscribe();
      alert("Welcome back! Purchases restored.");
    } else {
      alert("No active subscriptions found on this device.");
    }
  };

  const getNextBillingDate = () => {
    const startStr = localStorage.getItem('subscription_start_date');
    const type = localStorage.getItem('subscription_type'); // 'monthly' | 'yearly'

    const startDate = startStr ? new Date(startStr) : new Date();
    
    if (isNaN(startDate.getTime())) return "Unknown";

    const nextDate = new Date(startDate);
    if (type === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isPremium) {
    return (
      <div className="p-6 max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <i className="fa-solid fa-crown text-4xl text-yellow-600"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">You are a Premium Member</h2>
        <p className="text-gray-600 max-w-sm">
          Thank you for investing in your mental health. You have full access to all resources and advanced features.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 w-full max-w-sm border border-gray-200 shadow-inner">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500">Status</span>
            <span className="text-green-600 font-bold flex items-center">
              <i className="fa-solid fa-circle-check mr-1.5 text-xs"></i> Active
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Next Billing</span>
            <span className="font-semibold text-gray-900">{getNextBillingDate()}</span>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4 pt-4 border-t border-gray-100">
             <div className="bg-blue-50 p-3 rounded-lg text-left">
                <p className="text-xs text-blue-800 leading-relaxed">
                   <i className="fa-solid fa-circle-info mr-1"></i>
                   <strong>Support:</strong> If you need to cancel or change your plan, please contact our support team or check your email receipt from Razorpay.
                </p>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2 mt-4">
          <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Upgrade to Premium
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Unlock Your Full Potential</h2>
          <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto">
            Experience complete peace of mind with unlimited access to all ReliefAnchor features.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
             <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
               <i className="fa-solid fa-shield-halved mr-1"></i> Secured by Razorpay
             </span>
             <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
               <i className="fa-solid fa-credit-card mr-1"></i> International Cards Accepted
             </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: 'fa-brain', title: 'Unlimited Chat', desc: 'No daily limits.' },
            { icon: 'fa-wind', title: 'Breathing Tools', desc: 'Anxiety relief.' },
            { icon: 'fa-gamepad', title: 'Relief Games', desc: 'Fun distractions.' },
            { icon: 'fa-music', title: 'Sleep Sounds', desc: 'Better rest.' },
            { icon: 'fa-chart-pie', title: 'Mood Analytics', desc: 'Weekly insights.' },
            { icon: 'fa-pen-fancy', title: 'Journal Prompts', desc: 'Unlimited ideas.' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center transition-transform hover:scale-105">
              <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center mb-3">
                <i className={`fa-solid ${f.icon} text-brand-600`}></i>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Monthly Plan */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-brand-300 transition-all relative flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-700">Monthly Plan</h3>
                <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                        {displaySymbol}{displayMonthly}/mo
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Perfect for short-term goals. Cancel anytime.</p>
                <div className="mt-6 space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600"><i className="fa-solid fa-check text-green-500 mr-2"></i> All Core Features</div>
                    <div className="flex items-center text-sm text-gray-600"><i className="fa-solid fa-check text-green-500 mr-2"></i> Cancel Anytime</div>
                </div>
                <div className="flex-grow"></div>
                <button 
                onClick={() => handleSubscribe('relief_anchor_monthly')}
                disabled={loading}
                className="w-full py-3 bg-white border-2 border-brand-600 text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors"
                >
                {loading && selectedSku === 'relief_anchor_monthly' ? 'Processing...' : 'Subscribe Monthly'}
                </button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gradient-to-b from-brand-600 to-brand-800 p-1 rounded-2xl shadow-2xl relative transform md:-translate-y-4 md:scale-105">
                <div className="bg-gradient-to-b from-brand-600 to-brand-700 p-6 rounded-xl text-white h-full flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0">
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-bl-xl shadow-md">
                        BEST VALUE
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-brand-100 mt-2">Yearly Plan</h3>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold">
                           {displaySymbol}{displayYearly}/yr
                        </span>
                    </div>
                    <p className="text-xs text-brand-200 mt-2 font-medium">Save significantly compared to monthly!</p>
                    <div className="mt-6 space-y-3 mb-8">
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> <strong>2 Months Free</strong></div>
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> Priority Support</div>
                    </div>
                    <div className="flex-grow"></div>
                    <button 
                        onClick={() => handleSubscribe('relief_anchor_yearly')}
                        disabled={loading}
                        className="w-full py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-lg text-lg"
                    >
                    {loading && selectedSku === 'relief_anchor_yearly' ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>Start Yearly <i className="fa-solid fa-arrow-right"></i></>
                    )}
                    </button>
                    <p className="text-[10px] text-center mt-3 opacity-60">
                    Secured by Razorpay
                    </p>
                </div>
            </div>
        </div>

        <div className="pt-8 pb-4 border-t border-gray-100 flex flex-col items-center space-y-4">
            <button 
                onClick={handleRestore}
                disabled={loading}
                className="text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors"
            >
                {loading ? 'Checking...' : 'Restore Purchases'}
            </button>
            <div className="flex gap-4 text-xs text-gray-400">
                <button onClick={() => onOpenLegal && onOpenLegal('privacy')} className="hover:underline">Privacy Policy</button>
                <span>•</span>
                <button onClick={() => onOpenLegal && onOpenLegal('terms')} className="hover:underline">Terms of Service</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionView;

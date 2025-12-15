import React, { useState, useEffect } from 'react';
import { getProducts, requestPurchase, restorePurchases, Product, USE_MOCK_BILLING } from '../services/billingService';
import { CurrencyCode, RegionCode } from '../types';
import { REGIONAL_PRICING } from '../constants';

interface SubscriptionViewProps {
  onSubscribe: () => void;
  isPremium: boolean;
  currency: CurrencyCode;
  region: RegionCode;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onSubscribe, isPremium, currency, region }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  // Get specific pricing for the current region or fallback to Global
  const currentPricing = REGIONAL_PRICING[region] || REGIONAL_PRICING['GLOBAL'];

  useEffect(() => {
    const loadProducts = async () => {
      const items = await getProducts();
      setProducts(items);
    };
    loadProducts();
  }, []);

  const handleSubscribe = async (productId: string) => {
    setSelectedSku(productId);
    setLoading(true);
    
    try {
      // In a real app, product would come from the store with local currency
      const success = await requestPurchase(productId);
      if (success) {
        onSubscribe();
        alert(`🎉 Subscription Confirmed!\n\nThank you for choosing ReliefAnchor Premium.`);
      }
    } catch (error) {
      alert("Purchase failed. Please try again.");
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
      onSubscribe();
      alert("Purchases restored successfully.");
    } else {
      alert("No active subscriptions found to restore.");
    }
  };

  const openSubscriptionManagement = () => {
    // Opens the Google Play Subscriptions management page
    window.open('https://play.google.com/store/account/subscriptions', '_blank');
  };

  // Helper to get dynamic next billing date (1 year from now for MVP)
  const getNextBillingDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
            <span className="text-gray-500">Plan</span>
            <span className="font-semibold text-gray-900">Yearly Premium</span>
          </div>
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

        {/* Management Actions */}
        <div className="w-full max-w-sm space-y-4 pt-4 border-t border-gray-100">
             <button 
                onClick={openSubscriptionManagement}
                className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center gap-2"
             >
                <i className="fa-brands fa-google-play text-gray-500"></i> Manage Subscription
             </button>
             
             <div className="bg-blue-50 p-3 rounded-lg text-left">
                <p className="text-xs text-blue-800 leading-relaxed">
                   <i className="fa-solid fa-circle-info mr-1"></i>
                   <strong>Cancellation Policy:</strong> Your subscription is managed securely by Google Play. To cancel or change your plan, please click the button above to visit your Google Play account settings.
                </p>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Verification Status Notice */}
        {USE_MOCK_BILLING && (
           <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-800">
                <i className="fa-solid fa-info-circle mr-1"></i>
                <strong>Region Detected:</strong> {region === 'IN' ? 'India' : region === 'US' ? 'United States' : region === 'UK' ? 'United Kingdom' : region} | <strong>Pricing:</strong> Localized (Mock)
              </p>
           </div>
        )}

        <div className="text-center space-y-2 mt-4">
          <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Upgrade to Premium
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Unlock Your Full Potential</h2>
          <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto">
            Experience complete peace of mind with unlimited access to all ReliefAnchor features.
          </p>
        </div>

        {/* Enhanced Features Grid */}
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Monthly Plan */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-brand-300 transition-all relative flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-700">Monthly Plan</h3>
                <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                        {currentPricing.currencySymbol}{currentPricing.monthly}/mo
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Perfect for short-term goals. Flexible & cancel anytime.</p>
                <div className="mt-6 space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600"><i className="fa-solid fa-check text-green-500 mr-2"></i> All Core Features</div>
                    <div className="flex items-center text-sm text-gray-600"><i className="fa-solid fa-check text-green-500 mr-2"></i> Cancel Anytime</div>
                </div>
                <div className="flex-grow"></div>
                <button 
                onClick={() => handleSubscribe('mindease_premium_monthly')}
                disabled={loading}
                className="w-full py-3 bg-white border-2 border-brand-600 text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors"
                >
                {loading && selectedSku === 'mindease_premium_monthly' ? 'Processing...' : 'Subscribe Monthly'}
                </button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gradient-to-b from-brand-600 to-brand-800 p-1 rounded-2xl shadow-2xl relative transform md:-translate-y-4 md:scale-105">
                <div className="bg-gradient-to-b from-brand-600 to-brand-700 p-6 rounded-xl text-white h-full flex flex-col relative overflow-hidden">
                    {/* Best Value Badge */}
                    <div className="absolute top-0 right-0">
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-bl-xl shadow-md">
                        BEST VALUE
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-brand-100 mt-2">Yearly Plan</h3>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold">
                           {currentPricing.currencySymbol}{currentPricing.yearly}/yr
                        </span>
                    </div>
                    <p className="text-xs text-brand-200 mt-2 font-medium">Save significantly compared to monthly!</p>
                    
                    <div className="mt-6 space-y-3 mb-8">
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> <strong>2 Months Free</strong></div>
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> Priority Support</div>
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> Exclusive Content</div>
                    </div>

                    <div className="flex-grow"></div>
                    <button 
                        onClick={() => handleSubscribe('mindease_premium_yearly')}
                        disabled={loading}
                        className="w-full py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-lg text-lg"
                    >
                    {loading && selectedSku === 'mindease_premium_yearly' ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>
                        Start Yearly <i className="fa-solid fa-arrow-right"></i>
                        </>
                    )}
                    </button>
                    <p className="text-[10px] text-center mt-3 opacity-60">
                    Secured by Google Play Billing
                    </p>
                </div>
            </div>
        </div>

        {/* Restore & Legal Footer (REQUIRED FOR APP STORE) */}
        <div className="pt-8 pb-4 border-t border-gray-100 flex flex-col items-center space-y-4">
            <button 
                onClick={handleRestore}
                className="text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors"
            >
                Restore Purchases
            </button>
            
            <div className="flex gap-4 text-xs text-gray-400">
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Please replace this with your Privacy Policy URL'); }} className="hover:underline">Privacy Policy</a>
                <span>•</span>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Please replace this with your Terms of Service URL'); }} className="hover:underline">Terms of Service</a>
            </div>
            
            <p className="text-[10px] text-gray-300 text-center max-w-xs">
                Subscriptions automatically renew unless auto-renew is turned off at least 24-hours before the end of the current period.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionView;
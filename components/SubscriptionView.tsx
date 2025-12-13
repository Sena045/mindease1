import React, { useState, useEffect } from 'react';
import { getProducts, requestPurchase, Product } from '../services/billingService';

interface SubscriptionViewProps {
  onSubscribe: () => void;
  isPremium: boolean;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onSubscribe, isPremium }) => {
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

  const handleSubscribe = async (product: Product) => {
    setSelectedSku(product.productId);
    setLoading(true);
    
    try {
      const success = await requestPurchase(product.productId);
      if (success) {
        onSubscribe();
        alert(`🎉 Subscription Confirmed!\n\nPlan: ${product.title}\nAmount: ${product.price}\n\nThank you for choosing MindEase Premium.`);
      }
    } catch (error) {
      alert("Purchase failed. Please try again.");
    } finally {
      setLoading(false);
      setSelectedSku(null);
    }
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
            <span className="font-semibold text-gray-900">25 Dec 2025</span>
          </div>
        </div>
        <button className="text-brand-600 text-sm font-medium hover:underline mt-4">
          Manage Subscription on Google Play
        </button>
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
            Experience complete peace of mind with unlimited access to all MindEase features.
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: 'fa-brain', title: 'Unlimited Chat', desc: 'No daily limits.' },
            { icon: 'fa-wind', title: 'Breathing Tools', desc: 'Anxiety relief.' },
            { icon: 'fa-music', title: 'Sleep Sounds', desc: 'Better rest.' },
            { icon: 'fa-chart-pie', title: 'Mood Analytics', desc: 'Weekly insights.' },
            { icon: 'fa-book-open', title: 'Full Library', desc: 'All articles.' },
            { icon: 'fa-user-doctor', title: 'Therapy Perks', desc: 'Booking priority.' },
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
        {products.length === 0 ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-brand-500 text-2xl"></i>
            <p className="text-gray-500 text-sm mt-2">Loading plans from store...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Monthly Plan */}
            {products.find(p => p.productId.includes('monthly')) && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-brand-300 transition-all relative flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-700">Monthly Plan</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">₹500</span>
                  <span className="text-sm text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Perfect for short-term goals. Flexible & cancel anytime.</p>
                <div className="mt-6 space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600"><i className="fa-solid fa-check text-green-500 mr-2"></i> All Core Features</div>
                    <div className="flex items-center text-sm text-gray-600"><i className="fa-solid fa-check text-green-500 mr-2"></i> Cancel Anytime</div>
                </div>
                <div className="flex-grow"></div>
                <button 
                  onClick={() => handleSubscribe(products.find(p => p.productId.includes('monthly'))!)}
                  disabled={loading}
                  className="w-full py-3 bg-white border-2 border-brand-600 text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors"
                >
                  {loading && selectedSku === 'mindease_premium_monthly' ? 'Processing...' : 'Subscribe Monthly'}
                </button>
              </div>
            )}

            {/* Yearly Plan - Best Value */}
            {products.find(p => p.productId.includes('yearly')) && (
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
                    <span className="text-4xl font-bold">₹5,000</span>
                    <span className="text-sm text-brand-100 ml-1">/year</span>
                    </div>
                    <p className="text-xs text-brand-200 mt-2 font-medium">Save ₹1,000 compared to monthly!</p>
                    
                    <div className="mt-6 space-y-3 mb-8">
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> <strong>2 Months Free</strong></div>
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> Priority Support</div>
                        <div className="flex items-center text-sm text-brand-50"><i className="fa-solid fa-check-circle text-yellow-400 mr-2"></i> Exclusive Content</div>
                    </div>

                    <div className="flex-grow"></div>
                    <button 
                        onClick={() => handleSubscribe(products.find(p => p.productId.includes('yearly'))!)}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionView;
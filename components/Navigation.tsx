import React from 'react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isPremium: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isPremium }) => {
  const navItems = [
    { view: AppView.CHAT, icon: 'fa-message', label: 'Chat' },
    { view: AppView.MOOD, icon: 'fa-chart-line', label: 'Mood' },
    { view: AppView.TOOLS, icon: 'fa-toolbox', label: 'Tools' },
    { view: AppView.PREMIUM, icon: isPremium ? 'fa-user' : 'fa-crown', label: isPremium ? 'Profile' : 'Premium' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 shadow-lg z-40 md:static md:shadow-none md:border-t-0 md:bg-transparent md:flex-col md:w-64 md:h-full md:border-r">
      {/* Desktop Logo (hidden on mobile) */}
      <div className="hidden md:block mb-8 px-2">
        <h1 className="text-2xl font-bold text-brand-700 flex items-center gap-2">
          <i className="fa-solid fa-spa"></i> MindEase
        </h1>
      </div>

      <div className="flex justify-between md:flex-col md:space-y-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 rounded-xl transition-all ${
              currentView === item.view
                ? 'text-brand-600 md:bg-brand-50 font-semibold'
                : 'text-gray-400 hover:text-gray-600 md:hover:bg-gray-50'
            } ${item.label === 'Premium' && currentView !== item.view ? 'text-yellow-600' : ''}`}
          >
            <i className={`fa-solid ${item.icon} text-xl md:text-lg mb-1 md:mb-0 md:mr-3`}></i>
            <span className="text-[10px] md:text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
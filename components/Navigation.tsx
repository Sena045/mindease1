import React from 'react';
import { AppView } from '../types';
import Logo from './Logo';

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
    <div className="w-full bg-white border-t border-gray-200 px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 md:w-64 md:h-full md:border-t-0 md:border-r md:shadow-none md:bg-transparent md:flex md:flex-col md:py-6">
      {/* Desktop Logo (hidden on mobile) */}
      <div className="hidden md:block mb-8 px-4">
        <div className="flex items-center gap-3">
           <Logo className="w-9 h-9 text-brand-600" />
           <h1 className="text-xl font-bold text-brand-800 tracking-tight">
            ReliefAnchor
           </h1>
        </div>
      </div>

      <div className="flex justify-between md:flex-col md:space-y-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 rounded-xl transition-all ${
              currentView === item.view
                ? 'text-brand-800 md:bg-brand-100 font-bold'
                : 'text-gray-500 hover:text-gray-700 md:hover:bg-gray-100'
            } ${item.label === 'Premium' && currentView !== item.view ? 'text-yellow-700' : ''}`}
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
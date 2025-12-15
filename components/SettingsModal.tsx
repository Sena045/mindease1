import React from 'react';
import { REGIONS, SUPPORTED_LANGUAGES, CURRENCY_SYMBOLS } from '../constants';
import { UserSettings, RegionCode, LanguageCode, CurrencyCode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegionCode = e.target.value as RegionCode;
    const regionData = REGIONS.find(r => r.code === newRegionCode);
    
    // Auto-update currency based on region for convenience, but user can override
    onUpdateSettings({
      ...settings,
      region: newRegionCode,
      currency: regionData ? regionData.currency : settings.currency
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      language: e.target.value as LanguageCode
    });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      currency: e.target.value as CurrencyCode
    });
  };

  const toggleSound = () => {
    onUpdateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
        <div className="bg-brand-800 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg"><i className="fa-solid fa-globe mr-2"></i> Preferences</h3>
          <button onClick={onClose} className="hover:text-brand-100">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Region Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">My Region</label>
            <div className="relative">
              <select 
                value={settings.region} 
                onChange={handleRegionChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-brand-600 font-medium text-gray-800"
              >
                {REGIONS.map(region => (
                  <option key={region.code} value={region.code}>{region.label}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-gray-500 pointer-events-none"></i>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Determines local pricing and cultural context.</p>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">AI Language</label>
            <div className="relative">
              <select 
                value={settings.language} 
                onChange={handleLanguageChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-brand-600 font-medium text-gray-800"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-gray-500 pointer-events-none"></i>
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Currency</label>
            <div className="relative">
              <select 
                value={settings.currency} 
                onChange={handleCurrencyChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-brand-600 font-medium text-gray-800"
              >
                {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                  <option key={code} value={code}>{code} ({symbol})</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-gray-500 pointer-events-none"></i>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
             <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">Sound Effects</span>
                <span className="text-xs text-gray-400">Play sounds for messages</span>
             </div>
             <button 
               onClick={toggleSound}
               className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${settings.soundEnabled ? 'bg-brand-600' : 'bg-gray-200'}`}
             >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-brand-700 text-white font-bold py-3 rounded-xl shadow-md hover:bg-brand-800 transition-colors mt-4"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
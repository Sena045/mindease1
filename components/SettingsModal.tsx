
import React from 'react';
import { REGIONS, SUPPORTED_LANGUAGES, CURRENCY_SYMBOLS } from '../constants';
import { UserSettings, RegionCode, LanguageCode, CurrencyCode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetData?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, onResetData }) => {
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

  const handleExportData = async () => {
    try {
        const chatHistory = localStorage.getItem('chat_history');
        const moodEntries = localStorage.getItem('mood_entries');
        const journalDraft = localStorage.getItem('journal_draft');

        const exportData = {
            date: new Date().toISOString(),
            chatHistory: chatHistory ? JSON.parse(chatHistory) : [],
            moodEntries: moodEntries ? JSON.parse(moodEntries) : [],
            journalDraft: journalDraft || ''
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const fileName = `ReliefAnchor_Backup_${new Date().toISOString().split('T')[0]}.json`;
        
        if (navigator.share) {
            const file = new File([dataStr], fileName, { type: 'application/json' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'ReliefAnchor Backup',
                    text: 'My mental wellness data backup.'
                });
                return;
            }
        }

        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        alert("Unable to export data. Please try again.");
        console.error(e);
    }
  };

  const handleReset = () => {
      if (window.confirm("CRITICAL WARNING: This will permanently delete all your chat history, mood logs, and journal entries from this device. This action cannot be undone.\n\nAre you sure?")) {
          if (onResetData) onResetData();
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="bg-brand-800 p-4 flex justify-between items-center text-white sticky top-0 z-10">
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

          {/* Data Management Section */}
          <div className="border-t border-gray-100 pt-4">
             <h4 className="text-sm font-bold text-gray-800 mb-2">Data & Privacy</h4>
             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 mb-3">
               <i className="fa-solid fa-shield-halved mr-1"></i>
               Data is stored locally.
             </div>
             
             <div className="space-y-3">
                <button 
                    onClick={handleExportData}
                    className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-download"></i> Export Data
                </button>
                
                <button 
                    onClick={handleReset}
                    className="w-full py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-trash"></i> Delete All Data
                </button>
             </div>
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

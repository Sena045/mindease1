import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import MoodTracker from './components/MoodTracker';
import WellnessTools from './components/WellnessTools';
import SubscriptionView from './components/SubscriptionView';
import Navigation from './components/Navigation';
import TherapistDirectory from './components/TherapistDirectory';
import SettingsModal from './components/SettingsModal';
import Logo from './components/Logo';
import { AppView, UserSettings } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [isPremium, setIsPremium] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Default Settings: GLOBAL, Sound Enabled
  const [settings, setSettings] = useState<UserSettings>({
    region: 'GLOBAL',
    currency: 'USD',
    language: 'en',
    soundEnabled: true
  });

  const handleSettingsUpdate = (newSettings: UserSettings) => {
    setSettings(newSettings);
    // In a real app, save to localStorage here
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return (
          <ChatInterface 
            isPremium={isPremium}
            onUnlock={() => setCurrentView(AppView.PREMIUM)}
            onNavigate={(view) => setCurrentView(view)}
            settings={settings}
          />
        );
      case AppView.MOOD:
        return (
          <MoodTracker 
            isPremium={isPremium}
            onUnlock={() => setCurrentView(AppView.PREMIUM)}
          />
        );
      case AppView.TOOLS:
        return (
          <WellnessTools 
            isPremium={isPremium} 
            onUnlock={() => setCurrentView(AppView.PREMIUM)} 
          />
        );
      case AppView.PREMIUM:
        return (
          <SubscriptionView 
            isPremium={isPremium} 
            onSubscribe={() => setIsPremium(true)}
            currency={settings.currency} 
            region={settings.region}
          />
        );
      case AppView.SETTINGS:
        // We open the modal instead of a full view for settings
        setIsSettingsOpen(true);
        setCurrentView(AppView.CHAT); // Go back to chat
        return null;
      default:
        return (
          <ChatInterface 
            isPremium={isPremium}
            onUnlock={() => setCurrentView(AppView.PREMIUM)}
            onNavigate={(view) => setCurrentView(view)}
            settings={settings}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-calm-bg font-sans overflow-hidden">
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleSettingsUpdate}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden md:block h-full shadow-xl z-20 relative">
           <Navigation 
            currentView={currentView} 
            setView={(view) => {
               if(view === AppView.SETTINGS) setIsSettingsOpen(true);
               else setCurrentView(view);
            }} 
            isPremium={isPremium}
          />
          {/* Settings Button Desktop */}
          <div className="absolute bottom-4 left-0 w-full px-4">
             <button onClick={() => setIsSettingsOpen(true)} className="flex items-center text-gray-600 hover:text-brand-800 w-full p-2 font-medium">
                <i className="fa-solid fa-globe mr-2"></i> Settings
             </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative w-full flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
             <h1 className="text-xl font-bold text-brand-900 flex items-center gap-2">
              <Logo className="w-8 h-8 text-brand-700" />
              ReliefAnchor
            </h1>
            <button onClick={() => setIsSettingsOpen(true)} className="text-gray-600 hover:text-brand-800">
                <i className="fa-solid fa-globe text-lg"></i>
            </button>
          </div>

          <div className="flex-1 w-full">
            {renderContent()}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Visible only on Mobile) */}
        <div className="md:hidden z-30">
          <Navigation 
            currentView={currentView} 
            setView={(view) => {
               if(view === AppView.SETTINGS) setIsSettingsOpen(true);
               else setCurrentView(view);
            }} 
            isPremium={isPremium}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
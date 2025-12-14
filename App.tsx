import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import MoodTracker from './components/MoodTracker';
import WellnessTools from './components/WellnessTools';
import SubscriptionView from './components/SubscriptionView';
import Navigation from './components/Navigation';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [isPremium, setIsPremium] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return (
          <ChatInterface 
            isPremium={isPremium}
            onUnlock={() => setCurrentView(AppView.PREMIUM)}
            onNavigate={(view) => setCurrentView(view)}
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
          />
        );
      default:
        return (
          <ChatInterface 
            isPremium={isPremium}
            onUnlock={() => setCurrentView(AppView.PREMIUM)}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-calm-bg font-sans overflow-hidden">
      
      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden md:block h-full shadow-xl z-20">
          <Navigation 
            currentView={currentView} 
            setView={setCurrentView} 
            isPremium={isPremium}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative w-full flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-center sticky top-0 z-30 shadow-sm">
             <h1 className="text-lg font-bold text-brand-700 flex items-center gap-2">
              <i className="fa-solid fa-spa"></i> MindEase
            </h1>
          </div>

          <div className="flex-1 w-full">
            {renderContent()}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Visible only on Mobile) */}
        <div className="md:hidden z-30">
          <Navigation 
            currentView={currentView} 
            setView={setCurrentView} 
            isPremium={isPremium}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
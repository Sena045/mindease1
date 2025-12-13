import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import MoodTracker from './components/MoodTracker';
import WellnessTools from './components/WellnessTools';
import SubscriptionView from './components/SubscriptionView';
import CrisisBanner from './components/CrisisBanner';
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
          />
        );
      case AppView.MOOD:
        return <MoodTracker />;
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
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-calm-bg font-sans">
      <CrisisBanner />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
        <Navigation 
          currentView={currentView} 
          setView={setCurrentView} 
          isPremium={isPremium}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative w-full">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-center sticky top-0 z-10">
             <h1 className="text-lg font-bold text-brand-700 flex items-center gap-2">
              <i className="fa-solid fa-spa"></i> MindEase
            </h1>
          </div>

          <div className="h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
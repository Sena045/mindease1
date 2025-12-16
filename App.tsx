import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import MoodTracker from './components/MoodTracker';
import WellnessTools from './components/WellnessTools';
import SubscriptionView from './components/SubscriptionView';
import Navigation from './components/Navigation';
import SettingsModal from './components/SettingsModal';
import LegalView from './components/LegalView';
import Logo from './components/Logo';
import { AppView, UserSettings } from './types';

const App: React.FC = () => {
  // --- STATE ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  
  // Safe initialization of Premium state
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('is_premium_user') === 'true';
      }
    } catch (e) {
      console.warn("LocalStorage access failed (isPremium)", e);
    }
    return false;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms'>('privacy');
  
  // Safe initialization of Offline state
  const [isOffline, setIsOffline] = useState(() => {
    try {
      return typeof navigator !== 'undefined' ? !navigator.onLine : false;
    } catch {
      return false;
    }
  });
  
  // Safe initialization of Settings with persistence
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('user_settings');
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
    // Default fallback
    return {
      region: 'GLOBAL',
      currency: 'USD',
      language: 'en',
      soundEnabled: true
    };
  });

  // --- SAFE EFFECTS ---
  useEffect(() => {
    try {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } catch (e) {
      console.warn("Event listener attachment failed", e);
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    try {
      localStorage.setItem('user_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to persist settings", e);
    }
  }, [settings]);

  // --- HANDLERS ---
  const handleUnlock = () => {
    setIsPremium(true);
    try {
      localStorage.setItem('is_premium_user', 'true');
    } catch (e) {
      console.warn("Failed to persist premium status", e);
    }
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  // --- SAFE RENDERER ---
  const renderContent = () => {
    try {
      switch (currentView) {
        case AppView.CHAT:
          return (
            <ChatInterface 
              isPremium={isPremium} 
              onUnlock={() => handleNavigate(AppView.PREMIUM)}
              onNavigate={handleNavigate}
              settings={settings}
              isOffline={isOffline}
            />
          );
        case AppView.MOOD:
          return <MoodTracker isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} />;
        case AppView.TOOLS:
          return <WellnessTools isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} />;
        case AppView.PREMIUM:
          return (
            <SubscriptionView 
              isPremium={isPremium} 
              onSubscribe={handleUnlock}
              currency={settings.currency} 
              region={settings.region}
              onOpenLegal={(type) => {
                setLegalType(type);
                handleNavigate(AppView.LEGAL);
              }}
            />
          );
        case AppView.SETTINGS:
          // Settings is modal, but if navigated to as view, show modal
          setTimeout(() => setIsSettingsOpen(true), 0);
          return <ChatInterface 
              isPremium={isPremium} 
              onUnlock={() => handleNavigate(AppView.PREMIUM)}
              onNavigate={handleNavigate}
              settings={settings}
              isOffline={isOffline}
            />;
        case AppView.LEGAL:
            return <LegalView type={legalType} onClose={() => handleNavigate(AppView.PREMIUM)} />;
        default:
          return (
            <div className="flex items-center justify-center h-full text-gray-500">
              Section not found.
            </div>
          );
      }
    } catch (e) {
      console.error("View rendering error:", e);
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <p className="text-red-500 mb-2">Something went wrong in this section.</p>
          <button 
            onClick={() => setCurrentView(AppView.CHAT)}
            className="text-brand-600 font-bold underline"
          >
            Return Home
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-calm-bg font-sans overflow-hidden text-gray-900">
       <SettingsModal 
         isOpen={isSettingsOpen} 
         onClose={() => setIsSettingsOpen(false)} 
         settings={settings}
         onUpdateSettings={setSettings}
       />
       
       <div className="flex flex-1 overflow-hidden h-full">
         {/* Desktop Nav */}
         <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 z-20 h-full">
            <Navigation 
               currentView={currentView} 
               setView={(v) => {
                  if (v === AppView.SETTINGS) setIsSettingsOpen(true);
                  else handleNavigate(v);
               }} 
               isPremium={isPremium} 
            />
         </aside>

         <main className="flex-1 flex flex-col relative w-full h-full bg-calm-bg">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 h-14 shrink-0 shadow-sm">
               <div className="flex items-center gap-2 font-bold text-brand-900">
                  <Logo className="w-6 h-6 text-brand-700" />
                  <span>ReliefAnchor</span>
               </div>
               <button onClick={() => setIsSettingsOpen(true)} className="text-gray-500 w-8 h-8 flex items-center justify-center">
                  <i className="fa-solid fa-gear"></i>
               </button>
            </header>

            <div className="flex-1 overflow-hidden relative w-full">
              {renderContent()}
            </div>

            {/* Mobile Nav */}
            <nav className="md:hidden bg-white border-t border-gray-200 z-30 shrink-0 pb-safe">
               <Navigation 
                  currentView={currentView} 
                  setView={(v) => {
                      if (v === AppView.SETTINGS) setIsSettingsOpen(true);
                      else handleNavigate(v);
                  }} 
                  isPremium={isPremium} 
               />
            </nav>
         </main>
       </div>
    </div>
  );
};

export default App;
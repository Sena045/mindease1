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

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: any) { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("App Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-center text-red-600">Something went wrong. Please reload.</div>;
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  // Start with loading true
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // --- STATE ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [isPremium, setIsPremium] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms'>('privacy');
  
  // Safe initializers
  const [isOffline, setIsOffline] = useState(navigator.onLine === false);
  const [settings, setSettings] = useState<UserSettings>({ 
    region: 'GLOBAL', currency: 'USD', language: 'en', soundEnabled: true 
  });

  // --- INITIALIZATION EFFECTS ---
  
  // 1. Force Loading Screen OFF after 2 seconds maximum
  // This guarantees the app never stays stuck on the spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("ReliefAnchor: Force loading complete");
      setIsAppLoading(false);
    }, 2000); 

    // Also try to load saved data immediately
    try {
      const savedPremium = localStorage.getItem('is_premium_user') === 'true';
      if (savedPremium) setIsPremium(true);

      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.warn("Storage load error", e);
    }

    return () => clearTimeout(timer);
  }, []);

  // 2. Network listeners
  useEffect(() => {
    const setOnline = () => setIsOffline(false);
    const setOffline = () => setIsOffline(true);
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  // 3. Save settings on change
  useEffect(() => {
    try { localStorage.setItem('user_settings', JSON.stringify(settings)); } catch(e){}
  }, [settings]);

  const handleUnlock = () => {
    setIsPremium(true);
    try { localStorage.setItem('is_premium_user', 'true'); } catch(e){}
  };

  const handleNavigate = (view: AppView) => setCurrentView(view);

  // --- LOADING VIEW ---
  if (isAppLoading) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-brand-50 animate-fade-in">
        <Logo className="w-16 h-16 text-brand-600 animate-bounce mb-4" />
        <h1 className="text-xl font-bold text-brand-800 tracking-tight">ReliefAnchor</h1>
        <p className="text-xs text-brand-500 mt-2 animate-pulse">Initializing...</p>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatInterface isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} onNavigate={handleNavigate} settings={settings} isOffline={isOffline} />;
      case AppView.MOOD:
        return <MoodTracker isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} />;
      case AppView.TOOLS:
        return <WellnessTools isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} />;
      case AppView.PREMIUM:
        return <SubscriptionView isPremium={isPremium} onSubscribe={handleUnlock} currency={settings.currency} region={settings.region} onOpenLegal={(type) => { setLegalType(type); handleNavigate(AppView.LEGAL); }} />;
      case AppView.SETTINGS:
        setTimeout(() => setIsSettingsOpen(true), 0);
        return <ChatInterface isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} onNavigate={handleNavigate} settings={settings} isOffline={isOffline} />;
      case AppView.LEGAL:
        return <LegalView type={legalType} onClose={() => handleNavigate(AppView.PREMIUM)} />;
      default:
        return <div className="p-4">View Not Found</div>;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-[100dvh] bg-calm-bg font-sans overflow-hidden text-gray-900">
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSettings={setSettings} />
        
        <div className="flex flex-1 overflow-hidden h-full">
          <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 z-20 h-full">
              <Navigation currentView={currentView} setView={(v) => { if (v === AppView.SETTINGS) setIsSettingsOpen(true); else handleNavigate(v); }} isPremium={isPremium} />
          </aside>

          <main className="flex-1 flex flex-col relative w-full h-full bg-calm-bg">
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

              <nav className="md:hidden bg-white border-t border-gray-200 z-30 shrink-0 pb-safe">
                <Navigation currentView={currentView} setView={(v) => { if (v === AppView.SETTINGS) setIsSettingsOpen(true); else handleNavigate(v); }} isPremium={isPremium} />
              </nav>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
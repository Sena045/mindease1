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

// Minimal Error Boundary to prevent blank screens
class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-800 p-6 text-center">
           <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
           <button onClick={() => window.location.reload()} className="bg-red-200 px-4 py-2 rounded-lg text-sm font-bold">Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  // State
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [isPremium, setIsPremium] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms'>('privacy');
  
  // Settings with defaults
  const [settings, setSettings] = useState<UserSettings>({ 
    region: 'GLOBAL', currency: 'USD', language: 'en', soundEnabled: true 
  });

  // CRITICAL: Force loading to finish after 2 seconds max
  useEffect(() => {
    const forcedTimer = setTimeout(() => {
      console.log("ReliefAnchor: Forced loading completion");
      setIsAppLoading(false);
    }, 2000);

    // Try to load data instantly
    try {
      const savedPremium = localStorage.getItem('is_premium_user');
      if (savedPremium === 'true') setIsPremium(true);
      
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.warn("Storage load skipped", e);
    }

    return () => clearTimeout(forcedTimer);
  }, []);

  // Persist settings
  useEffect(() => {
    if (!isAppLoading) {
      try { localStorage.setItem('user_settings', JSON.stringify(settings)); } catch(e){}
    }
  }, [settings, isAppLoading]);

  // Navigation handlers
  const handleNavigate = (view: AppView) => setCurrentView(view);
  const handleUnlock = () => {
    setIsPremium(true);
    try { localStorage.setItem('is_premium_user', 'true'); } catch(e){}
  };

  // Loading Screen
  if (isAppLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-brand-50 z-50">
        <div className="animate-bounce mb-4">
           <Logo className="w-16 h-16 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-brand-800 tracking-tight">ReliefAnchor</h1>
        <div className="mt-4 flex gap-1">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-brand-600 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    );
  }

  // View Router
  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatInterface isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} onNavigate={handleNavigate} settings={settings} />;
      case AppView.MOOD:
        return <MoodTracker isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} />;
      case AppView.TOOLS:
        return <WellnessTools isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} />;
      case AppView.PREMIUM:
        return <SubscriptionView isPremium={isPremium} onSubscribe={handleUnlock} currency={settings.currency} region={settings.region} onOpenLegal={(type) => { setLegalType(type); handleNavigate(AppView.LEGAL); }} />;
      case AppView.SETTINGS:
        setTimeout(() => setIsSettingsOpen(true), 0);
        return <ChatInterface isPremium={isPremium} onUnlock={() => handleNavigate(AppView.PREMIUM)} onNavigate={handleNavigate} settings={settings} />;
      case AppView.LEGAL:
        return <LegalView type={legalType} onClose={() => handleNavigate(AppView.PREMIUM)} />;
      default:
        return <div className="p-8 text-center">View not found</div>;
    }
  };

  return (
    <GlobalErrorBoundary>
      <div className="flex flex-col h-[100dvh] bg-calm-bg font-sans overflow-hidden text-gray-900 w-full">
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSettings={setSettings} />
        
        <div className="flex flex-1 overflow-hidden h-full w-full">
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

              <nav className="md:hidden bg-white border-t border-gray-200 z-30 shrink-0 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Navigation currentView={currentView} setView={(v) => { if (v === AppView.SETTINGS) setIsSettingsOpen(true); else handleNavigate(v); }} isPremium={isPremium} />
              </nav>
          </main>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};

export default App;
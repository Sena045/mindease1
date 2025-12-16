
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AppView, UserSettings } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { playChatSound } from '../services/soundEffects';
import AffirmationWidget from './AffirmationWidget';
import Logo from './Logo';
import { CHAT_LOCALE_DATA } from '../constants';

interface ChatInterfaceProps {
  isPremium: boolean;
  onUnlock: () => void;
  onNavigate: (view: AppView) => void;
  settings: UserSettings;
  isOffline?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isPremium, onUnlock, onNavigate, settings, isOffline = false }) => {
  const localeData = CHAT_LOCALE_DATA[settings.language] || CHAT_LOCALE_DATA['en'];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      if (saved) {
        // Robust parser: Handles dates that might be strings or actual Date objects
        return JSON.parse(saved, (key, value) => {
          if (key === 'timestamp') {
             const d = new Date(value);
             return isNaN(d.getTime()) ? new Date() : d; // Fallback to now if invalid
          }
          return value;
        });
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [{
      id: 'init',
      role: 'model',
      text: localeData.greeting,
      timestamp: new Date(),
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    } catch (e) {
        console.error("Failed to save chat history (Storage likely full)", e);
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'init') {
      setMessages([{
        ...messages[0],
        text: localeData.greeting
      }]);
    }
  }, [settings.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const FREE_MSG_LIMIT = 5;
  
  const getDailyUsage = () => {
    const today = new Date().toDateString();
    return messages.filter(m => 
      m.role === 'user' && 
      (m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp)).toDateString() === today
    ).length;
  };

  const dailyUsage = getDailyUsage();
  const isLimitReached = !isPremium && dailyUsage >= FREE_MSG_LIMIT;
  const msgsLeft = Math.max(0, FREE_MSG_LIMIT - dailyUsage);

  const CRISIS_REGEX = /(suicid|kill myself|end my life|want to die|hurt myself|no reason to live)/i;
  
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const handleSend = async (textOverride?: string) => {
    if (isOffline) {
        alert("You are offline. Please check your internet connection to chat.");
        return;
    }

    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading || isLimitReached) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    setIsLoading(true);

    if (settings.soundEnabled) playChatSound('send');

    const newUserMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    if (CRISIS_REGEX.test(textToSend)) {
      const safetyMessage: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: "I am really concerned about what you just shared. You are not alone, and there is help available. Please reach out to someone you trust immediately.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, safetyMessage]);
      setIsLoading(false);
      if (settings.soundEnabled) playChatSound('receive');
      return;
    }

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToGemini(textToSend, history, settings);

      const modelMessage: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, modelMessage]);
      if (settings.soundEnabled) playChatSound('receive');

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
        setMessages([{
            id: 'init',
            role: 'model',
            text: localeData.greeting,
            timestamp: new Date(),
        }]);
    }
  }

  const getSmartAction = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('breath') || lower.includes('calm down') || lower.includes('panic')) {
      return { label: 'Start Breathing Exercise', icon: 'fa-wind', view: AppView.TOOLS };
    }
    if (lower.includes('journal') || lower.includes('write') || lower.includes('diary')) {
      return { label: 'Open Journal', icon: 'fa-pen-fancy', view: AppView.TOOLS };
    }
    if (lower.includes('mood') || lower.includes('track') || lower.includes('log')) {
      return { label: 'Log Mood', icon: 'fa-chart-line', view: AppView.MOOD };
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-calm-bg">
      <div className="bg-blue-50 p-2 text-center text-[10px] text-blue-800 border-b border-blue-100 flex justify-between items-center px-4 z-10 shadow-sm">
        <span className="opacity-70">Bot generated. Not medical advice.</span>
        <div className="flex gap-3 items-center">
            {messages.length > 2 && (
                <button onClick={handleClearChat} className="text-blue-600 hover:text-blue-800 underline">
                    Clear
                </button>
            )}
            {!isPremium && (
            <span className={`font-bold ${msgsLeft <= 2 ? 'text-red-600' : 'text-blue-700'}`}>
                {msgsLeft > 0 ? `${msgsLeft} free msgs today` : 'Daily limit reached'}
            </span>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 space-y-5">
        <AffirmationWidget language={settings.language} />

        <div className="px-4 space-y-6">
          {messages.map((msg) => {
            const smartAction = msg.role === 'model' ? getSmartAction(msg.text) : null;
            const timeString = (msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}
              >
                {msg.role === 'model' && (
                  <div className="flex items-center space-x-2 mb-1 ml-1">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200">
                      <Logo className="w-4 h-4 text-brand-700" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Anya</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-700 text-white rounded-br-none shadow-brand-600/20'
                      : msg.isError 
                        ? 'bg-red-50 text-red-800 border border-red-100 rounded-bl-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {smartAction && (
                  <button
                    onClick={() => onNavigate(smartAction.view)}
                    className="mt-2 ml-1 bg-white border border-brand-200 text-brand-800 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-brand-50 transition-colors flex items-center gap-2 animate-fade-in"
                  >
                    <i className={`fa-solid ${smartAction.icon}`}></i>
                    {smartAction.label}
                  </button>
                )}
                
                <span className={`text-[10px] text-gray-400 mt-1 px-1 ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                  {timeString}
                </span>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex flex-col items-start space-y-1 animate-fade-in">
               <div className="flex items-center space-x-2 ml-1">
                    <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center">
                       <Logo className="w-3 h-3 text-brand-400" />
                    </div>
                    <span className="text-xs text-gray-400">Anya is typing...</span>
               </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-1.5 items-center h-5">
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isLimitReached ? (
        <div className="bg-white p-6 border-t border-gray-200 sticky bottom-0 z-20 flex flex-col items-center text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
             <i className="fa-solid fa-lock text-yellow-700 text-xl"></i>
          </div>
          <div>
              <h3 className="font-bold text-gray-800 text-lg">Daily Limit Reached</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                You've used your 5 free messages for today. Upgrade to Premium for unlimited chats.
              </p>
          </div>
          <button 
              onClick={onUnlock}
              className="w-full max-w-sm bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-900 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
          >
              <i className="fa-solid fa-crown text-yellow-300"></i> Unlock Unlimited Access
          </button>
        </div>
      ) : (
        <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20">
          {messages.length < 3 && !isLoading && !isOffline && (
            <div className="flex space-x-2 overflow-x-auto p-3 pb-0 scrollbar-hide">
              {localeData.quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(reply)}
                  className="whitespace-nowrap bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs px-3 py-1.5 rounded-full border border-brand-200 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 md:p-4">
            <div className="flex items-end space-x-2 relative">
              <textarea
                ref={textareaRef}
                value={isOffline ? '' : input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isOffline || isLoading}
                placeholder={isOffline ? "Waiting for connection..." : "Type your thoughts here..."}
                className={`flex-1 rounded-3xl py-3 px-5 focus:outline-none resize-none max-h-32 scrollbar-hide text-base leading-relaxed border overflow-hidden
                    ${isOffline 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-gray-50 text-gray-800 border-gray-200 focus:ring-2 focus:ring-brand-600'}`}
                rows={1}
                style={{ minHeight: '48px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || isOffline}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform ${
                  !input.trim() || isLoading || isOffline
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95'
                    : 'bg-brand-700 hover:bg-brand-800 text-white shadow-md hover:scale-105'
                }`}
                style={{ height: '48px' }}
              >
                <i className={`fa-solid ${isOffline ? 'fa-wifi-slash' : 'fa-paper-plane'} text-sm ${isLoading ? 'animate-pulse' : ''}`}></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;

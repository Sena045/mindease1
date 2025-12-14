import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AppView, UserSettings } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import AffirmationWidget from './AffirmationWidget';
import { CHAT_LOCALE_DATA } from '../constants';

interface ChatInterfaceProps {
  isPremium: boolean;
  onUnlock: () => void;
  onNavigate: (view: AppView) => void;
  settings: UserSettings;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isPremium, onUnlock, onNavigate, settings }) => {
  // Get localized data based on settings
  const localeData = CHAT_LOCALE_DATA[settings.language] || CHAT_LOCALE_DATA['en'];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: localeData.greeting,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update greeting if language changes and conversation hasn't started yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'init') {
      setMessages([{
        ...messages[0],
        text: localeData.greeting
      }]);
    }
  }, [settings.language]);

  // Constants
  const FREE_MSG_LIMIT = 5;
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = !isPremium && userMessageCount >= FREE_MSG_LIMIT;
  const msgsLeft = FREE_MSG_LIMIT - userMessageCount;

  // Crisis Keywords Regex
  const CRISIS_REGEX = /(suicid|kill myself|end my life|want to die|hurt myself|no reason to live)/i;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading || isLimitReached) return;

    setInput('');
    setIsLoading(true);

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Safety Check: Immediate client-side detection
    if (CRISIS_REGEX.test(textToSend)) {
      
      const safetyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I am really concerned about what you just shared. You are not alone, and there is help available. Please reach out to someone you trust.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, safetyMessage]);
      setIsLoading(false);
      return;
    }

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Pass user settings for language/region adaptation
      const responseText = await sendMessageToGemini(textToSend, history, settings);

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
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

  // Helper to detect if a message should suggest a tool
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
      {/* Disclaimer / Counter */}
      <div className="bg-blue-50 p-2 text-center text-[10px] text-blue-600 border-b border-blue-100 flex justify-between px-4 z-10 shadow-sm">
        <span>Bot generated. Not medical advice.</span>
        {!isPremium && (
          <span className={`font-bold ${msgsLeft <= 2 ? 'text-red-500' : 'text-blue-600'}`}>
            {msgsLeft > 0 ? `${msgsLeft} free messages left` : 'Limit reached'}
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-4 space-y-5">
        {/* Daily Affirmation Widget at the top of chat */}
        <AffirmationWidget />

        <div className="px-4 space-y-6">
          {messages.map((msg) => {
            const smartAction = msg.role === 'model' ? getSmartAction(msg.text) : null;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Avatar / Name for Bot */}
                {msg.role === 'model' && (
                  <div className="flex items-center space-x-2 mb-1 ml-1">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200">
                      <i className="fa-solid fa-spa text-brand-600 text-[10px]"></i>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Anya</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-brand-500/20'
                      : msg.isError 
                        ? 'bg-red-50 text-red-800 border border-red-100 rounded-bl-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Smart Action Button (If detected) */}
                {smartAction && (
                  <button
                    onClick={() => onNavigate(smartAction.view)}
                    className="mt-2 ml-1 bg-white border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-brand-50 transition-colors flex items-center gap-2 animate-fade-in"
                  >
                    <i className={`fa-solid ${smartAction.icon}`}></i>
                    {smartAction.label}
                  </button>
                )}
                
                {/* Timestamp */}
                <span className={`text-[10px] text-gray-300 mt-1 px-1 ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex flex-col items-start space-y-1 animate-fade-in">
               <div className="flex items-center space-x-2 ml-1">
                    <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center">
                      <i className="fa-solid fa-spa text-brand-300 text-[10px]"></i>
                    </div>
                    <span className="text-xs text-gray-400">Anya is typing...</span>
               </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-1.5 items-center h-5">
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area or Upgrade Prompt */}
      {isLimitReached ? (
        <div className="bg-white p-6 border-t border-gray-200 sticky bottom-0 z-20 flex flex-col items-center text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
             <i className="fa-solid fa-lock text-yellow-600 text-xl"></i>
          </div>
          <div>
              <h3 className="font-bold text-gray-800 text-lg">Daily Limit Reached</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                You've used your 5 free messages. Upgrade to Premium for unlimited chats with Anya.
              </p>
          </div>
          <button 
              onClick={onUnlock}
              className="w-full max-w-sm bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
          >
              <i className="fa-solid fa-crown text-yellow-300"></i> Unlock Unlimited Access
          </button>
        </div>
      ) : (
        <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20">
          {/* Quick Replies - Horizontal Scroll */}
          {messages.length < 3 && !isLoading && (
            <div className="flex space-x-2 overflow-x-auto p-3 pb-0 scrollbar-hide">
              {localeData.quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(reply)}
                  className="whitespace-nowrap bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs px-3 py-1.5 rounded-full border border-brand-100 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 md:p-4">
            <div className="flex items-end space-x-2 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your thoughts here..."
                className="flex-1 bg-gray-100 text-gray-800 rounded-3xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none h-12 max-h-32 scrollbar-hide text-sm leading-relaxed"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform ${
                  !input.trim() || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:scale-105'
                }`}
              >
                <i className={`fa-solid fa-paper-plane text-sm ${isLoading ? 'animate-pulse' : ''}`}></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import AffirmationWidget from './AffirmationWidget';

interface ChatInterfaceProps {
  isPremium: boolean;
  onUnlock: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isPremium, onUnlock }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "Namaste! I'm Anya, your companion here at MindEase. How are you feeling today? You can share anything with me—I'm here to listen without judgment.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Constants
  const FREE_MSG_LIMIT = 10;
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = !isPremium && userMessageCount >= FREE_MSG_LIMIT;
  const msgsLeft = FREE_MSG_LIMIT - userMessageCount;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isLimitReached) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToGemini(userText, history);

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

  return (
    <div className="flex flex-col h-full bg-calm-bg">
      {/* Disclaimer / Counter */}
      <div className="bg-blue-50 p-2 text-center text-[10px] text-blue-600 border-b border-blue-100 flex justify-between px-4">
        <span>Bot generated. Not medical advice.</span>
        {!isPremium && (
          <span className={`font-bold ${msgsLeft <= 3 ? 'text-red-500' : 'text-blue-600'}`}>
            {msgsLeft > 0 ? `${msgsLeft} free messages left` : 'Limit reached'}
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-4 space-y-4">
        {/* Daily Affirmation Widget at the top of chat */}
        <AffirmationWidget />

        <div className="px-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm md:text-base leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : msg.isError 
                      ? 'bg-red-100 text-red-800 rounded-bl-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
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
                You've used your 10 free messages. Upgrade to Premium for unlimited chats with Anya.
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
        <div className="bg-white p-3 md:p-4 border-t border-gray-200 sticky bottom-0">
          <div className="flex items-center space-x-2 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your thoughts here..."
              className="flex-1 bg-gray-100 text-gray-800 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none h-12 scrollbar-hide text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                !input.trim() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'
              }`}
            >
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
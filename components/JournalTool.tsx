import React, { useState, useEffect } from 'react';
import { JOURNAL_PROMPTS } from '../constants';

interface JournalToolProps {
  onClose: () => void;
  isPremium: boolean;
  onUnlock: () => void;
}

const JournalTool: React.FC<JournalToolProps> = ({ onClose, isPremium, onUnlock }) => {
  const [entry, setEntry] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');

  useEffect(() => {
    // Pick initial random prompt
    if (!currentPrompt) {
        setCurrentPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
    }
    // Load saved draft
    const saved = localStorage.getItem('journal_draft');
    if (saved) setEntry(saved);
  }, []);

  // Debounced Save to LocalStorage to prevent main thread lag on rapid typing
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('journal_draft', entry);
    }, 500); // Wait 500ms after last keystroke

    return () => {
      clearTimeout(handler);
    };
  }, [entry]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEntry(e.target.value);
  };

  const handleClear = () => {
    if (window.confirm('Clear your current entry?')) {
      setEntry('');
      localStorage.removeItem('journal_draft');
    }
  };

  const handleNewPrompt = () => {
      if (!isPremium) {
          onUnlock();
          return;
      }
      const newPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
      setCurrentPrompt(newPrompt);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onClose} className="text-gray-500 hover:text-brand-600">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>
        <h2 className="font-bold text-gray-800">My Journal</h2>
        <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-600">
          Clear
        </button>
      </div>

      <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase mb-1">Writing Prompt</p>
        <p className="text-gray-800 italic text-sm">{currentPrompt}</p>
        
        <button 
          onClick={handleNewPrompt}
          className={`text-[10px] mt-2 flex items-center gap-1 ${!isPremium ? 'text-gray-400 hover:text-brand-600' : 'text-brand-500 hover:underline'}`}
        >
          {isPremium ? (
              <>
                 <i className="fa-solid fa-refresh"></i> New Prompt
              </>
          ) : (
              <>
                 <i className="fa-solid fa-lock"></i> Unlock more prompts
              </>
          )}
        </button>
      </div>

      <textarea
        className="flex-1 w-full p-4 bg-white rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-base leading-relaxed"
        placeholder="Start writing here..."
        value={entry}
        onChange={handleChange}
      />
      
      <p className="text-center text-xs text-gray-400 mt-2">
        <i className="fa-solid fa-lock mr-1"></i> 
        Entries are stored locally on your device for privacy.
      </p>
    </div>
  );
};

export default JournalTool;
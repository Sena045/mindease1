import React, { useState, useEffect, useRef } from 'react';
import { SELF_HELP_RESOURCES } from '../constants';
import { Resource } from '../types';

interface SelfHelpLibraryProps {
  isPremium: boolean;
  onUnlock: () => void;
  onClose?: () => void;
}

const SelfHelpLibrary: React.FC<SelfHelpLibraryProps> = ({ isPremium, onUnlock, onClose }) => {
  const [filter, setFilter] = useState<string>('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const filtered = filter === 'All' 
    ? SELF_HELP_RESOURCES 
    : SELF_HELP_RESOURCES.filter(r => r.category === filter);

  const categories = ['All', 'Anxiety', 'Sleep', 'Mindfulness', 'Depression'];

  // Handle opening a resource
  const handleOpen = (resource: Resource) => {
    if (resource.isPremium && !isPremium) {
      onUnlock();
    } else {
      setSelectedResource(resource);
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const toggleAudio = () => {
      setIsPlaying(!isPlaying);
  };

  // Handle Audio Synthesis (Sound Generation)
  useEffect(() => {
    if (isPlaying) {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        
        const ctx = new Ctx();
        audioCtxRef.current = ctx;

        // Create oscillator for drone sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Binaural beat setup (low frequency soothing hum)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(150, ctx.currentTime); // Base tone
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(154, ctx.currentTime); // Slight detune for "beating" effect

        // Soft volume envelope
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2); // Slow fade in

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

      } catch (e) {
        console.error("Audio playback error:", e);
      }
    } else {
      // Stop Audio
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [isPlaying]);

  // Simulated Audio Progress
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setIsPlaying(false);
                    return 0;
                }
                return prev + 0.2; // increment speed
            });
        }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // --- DETAIL VIEW RENDER ---
  if (selectedResource) {
    return (
      <div className="flex flex-col min-h-full max-w-2xl mx-auto p-4 animate-fade-in pb-24">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setSelectedResource(null)} 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors mr-4"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="flex-1">
             <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{selectedResource.category}</span>
             <h2 className="text-xl font-bold text-gray-800 leading-tight">{selectedResource.title}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {/* Visual Header / Placeholder Image */}
           <div className={`h-40 w-full flex items-center justify-center ${
              selectedResource.category === 'Sleep' ? 'bg-indigo-100' :
              selectedResource.category === 'Anxiety' ? 'bg-orange-100' :
              'bg-emerald-100'
           }`}>
              <i className={`fa-solid ${selectedResource.type === 'audio' ? 'fa-headphones' : 'fa-book-open'} text-6xl opacity-20`}></i>
           </div>

           <div className="p-6">
             {/* Metadata */}
             <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 border-b border-gray-100 pb-4">
                <span className="flex items-center"><i className="fa-regular fa-clock mr-1.5"></i> {selectedResource.duration}</span>
                <span className="flex items-center"><i className="fa-solid fa-tag mr-1.5"></i> {selectedResource.type === 'audio' ? 'Audio Guide' : 'Article'}</span>
             </div>

             {/* Actual Content (Mock) */}
             {selectedResource.type === 'audio' ? (
               <div className="flex flex-col items-center py-6">
                  <button 
                    onClick={toggleAudio}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${isPlaying ? 'bg-brand-600 shadow-brand-200' : 'bg-brand-500 shadow-brand-100'}`}
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-2xl ${!isPlaying ? 'ml-1' : ''}`}></i>
                  </button>
                  <p className="text-sm font-bold text-gray-800 mt-4">{isPlaying ? 'Playing Audio...' : 'Tap to Play'}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden relative">
                    <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between w-full text-[10px] text-gray-400 mt-2">
                     <span>{Math.floor(progress * 0.05)}:{(Math.floor((progress * 0.05 * 60) % 60)).toString().padStart(2, '0')}</span>
                     <span>{selectedResource.duration}</span>
                  </div>
               </div>
             ) : (
               <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <p className="mb-4 font-medium text-lg">{selectedResource.content}</p>
                  <p className="mb-4">
                    Mental health is an integral part of our overall well-being. This article explores practical ways to manage daily stressors.
                    Start by acknowledging your feelings. It is okay not to be okay.
                  </p>
                  <h4 className="font-bold text-gray-900 mb-2">Key Strategies</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Mindfulness:</strong> Spend 5 minutes daily observing your breath.</li>
                    <li><strong>Routine:</strong> Wake up and sleep at consistent times.</li>
                    <li><strong>Connection:</strong> Talk to one friend or family member today.</li>
                  </ul>
                  <p className="mb-4">
                    When we ignore our emotional needs, they often manifest physically. Headaches, fatigue, and muscle tension can all be signs of underlying stress.
                  </p>
                  <p className="mb-4">
                    Recovery is not linear. Some days will be harder than others. Be patient with yourself.
                  </p>
                   <p>
                    For more advanced techniques, try the Breathing Tool in the Wellness section or chat with Anya for personalized guidance.
                  </p>
               </div>
             )}
           </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW RENDER ---
  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-800">Wellness Library</h2>
        </div>
        {!isPremium && (
          <button onClick={onUnlock} className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow flex items-center gap-1">
            <i className="fa-solid fa-crown text-yellow-600"></i> Go Premium
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === cat 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((resource) => {
          const isLocked = resource.isPremium && !isPremium;
          
          return (
            <div 
              key={resource.id} 
              className={`bg-white p-5 rounded-xl border relative overflow-hidden transition-all ${
                isLocked 
                  ? 'border-gray-200 cursor-pointer hover:border-yellow-400 group' 
                  : 'border-gray-100 shadow-sm hover:shadow-md cursor-pointer group'
              }`}
              onClick={() => handleOpen(resource)}
            >
              {/* Lock Overlay for Premium content */}
              {isLocked && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2 shadow-lg scale-90 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-lock text-yellow-600 text-lg"></i>
                  </div>
                  <span className="text-xs font-bold text-gray-800 bg-white px-3 py-1 rounded-full shadow-sm">
                    Unlock Premium
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    resource.category === 'Anxiety' ? 'bg-orange-100 text-orange-700' :
                    resource.category === 'Sleep' ? 'bg-indigo-100 text-indigo-700' :
                    resource.category === 'Depression' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {resource.category}
                  </span>
                  {resource.isPremium && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                      <i className="fa-solid fa-crown mr-1 text-[8px]"></i> PRO
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  <i className="fa-regular fa-clock mr-1"></i>{resource.duration}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-brand-700 transition-colors">{resource.title}</h3>
              
              <div className={`text-sm text-gray-600 mb-4 line-clamp-3 ${isLocked ? 'blur-[1px]' : ''}`}>
                {resource.content}
              </div>

              <span className={`text-sm font-semibold flex items-center ${isLocked ? 'text-gray-400' : 'text-brand-600 group-hover:underline'}`}>
                {resource.type === 'audio' ? 'Listen Now' : 'Read More'} 
                <i className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-arrow-right'} ml-2 text-xs`}></i>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelfHelpLibrary;
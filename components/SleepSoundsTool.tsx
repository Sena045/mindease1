import React, { useState } from 'react';

const SOUNDS = [
  { id: 'rain', name: 'Gentle Rain', icon: 'fa-cloud-rain', color: 'bg-blue-100 text-blue-600' },
  { id: 'forest', name: 'Forest Birds', icon: 'fa-tree', color: 'bg-green-100 text-green-600' },
  { id: 'waves', name: 'Ocean Waves', icon: 'fa-water', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'white', name: 'White Noise', icon: 'fa-fan', color: 'bg-gray-100 text-gray-600' },
];

const SleepSoundsTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [playing, setPlaying] = useState<string | null>(null);

  const toggleSound = (id: string) => {
    if (playing === id) {
      setPlaying(null);
    } else {
      setPlaying(id);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onClose} className="text-gray-500 hover:text-brand-600">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>
        <h2 className="font-bold text-gray-800">Sleep Sounds</h2>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SOUNDS.map((sound) => (
          <button
            key={sound.id}
            onClick={() => toggleSound(sound.id)}
            className={`p-6 rounded-2xl border transition-all flex items-center gap-4 text-left ${
              playing === sound.id
                ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500'
                : 'border-gray-100 bg-white shadow-sm hover:border-brand-200 hover:shadow-md'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sound.color} ${playing === sound.id ? 'animate-pulse' : ''}`}>
              <i className={`fa-solid ${sound.icon} text-xl`}></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{sound.name}</h3>
              <p className="text-xs text-brand-600 font-medium">
                {playing === sound.id ? 'Playing...' : 'Tap to play'}
              </p>
            </div>
            {playing === sound.id && (
              <div className="ml-auto">
                <i className="fa-solid fa-pause text-brand-600"></i>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {playing && (
        <div className="mt-8 bg-gray-800 text-white p-4 rounded-xl flex items-center justify-between shadow-lg transition-all">
           <div className="flex items-center gap-3">
             <div className="flex gap-1 items-end h-4">
               <div className="w-1 bg-brand-400 animate-bounce h-2" style={{ animationDuration: '0.6s' }}></div>
               <div className="w-1 bg-brand-400 animate-bounce h-4" style={{ animationDuration: '0.8s' }}></div>
               <div className="w-1 bg-brand-400 animate-bounce h-3" style={{ animationDuration: '0.5s' }}></div>
             </div>
             <span className="text-sm font-medium">Now Playing: {SOUNDS.find(s => s.id === playing)?.name}</span>
           </div>
           <button onClick={() => setPlaying(null)} className="hover:text-brand-300">
             <i className="fa-solid fa-stop text-lg"></i>
           </button>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-auto pt-8">
        Audio is simulated for this MVP demo.
      </p>
    </div>
  );
};

export default SleepSoundsTool;
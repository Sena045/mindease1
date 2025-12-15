import React, { useState, useEffect, useRef } from 'react';

const SOUNDS = [
  { id: 'rain', name: 'Gentle Rain', icon: 'fa-cloud-rain', color: 'bg-blue-100 text-blue-600' },
  { id: 'forest', name: 'Forest Birds', icon: 'fa-tree', color: 'bg-green-100 text-green-600' },
  { id: 'waves', name: 'Ocean Waves', icon: 'fa-water', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'white', name: 'White Noise', icon: 'fa-fan', color: 'bg-gray-100 text-gray-600' },
];

const SleepSoundsTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const birdTimeoutRef = useRef<any>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Handle sound changes
  useEffect(() => {
    if (playing) {
      playAudio(playing);
    } else {
      stopAudio();
    }
  }, [playing]);

  const stopAudio = () => {
    if (birdTimeoutRef.current) {
        clearTimeout(birdTimeoutRef.current);
        birdTimeoutRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        // Ramp down volume before closing for smooth stop
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
        }
        setTimeout(() => {
            audioCtxRef.current?.close();
            audioCtxRef.current = null;
        }, 150);
      } catch (e) {
        console.error("Error closing audio context", e);
      }
    }
  };

  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const playAudio = (type: string) => {
    stopAudio(); // Ensure clean slate
    
    try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;
    
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1); // Fade in
    
        const noiseBuffer = createNoiseBuffer(ctx);
    
        if (type === 'white') {
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuffer;
          noiseSrc.loop = true;
          noiseSrc.connect(masterGain);
          noiseSrc.start();
        } else if (type === 'rain') {
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuffer;
          noiseSrc.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          noiseSrc.connect(filter);
          filter.connect(masterGain);
          
          noiseSrc.start();
        } else if (type === 'waves') {
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuffer;
          noiseSrc.loop = true;
    
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.Q.value = 1;
    
          // LFO to modulate filter frequency for wave effect
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.2; // 5 seconds cycle
    
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 600; // Modulate depth
    
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          filter.frequency.setValueAtTime(800, ctx.currentTime);
    
          noiseSrc.connect(filter);
          filter.connect(masterGain);
    
          noiseSrc.start();
          lfo.start();
        } else if (type === 'forest') {
          // Wind/Leaves background
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuffer;
          noiseSrc.loop = true;
    
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 600;
          const filter2 = ctx.createBiquadFilter();
          filter2.type = 'lowpass';
          filter2.frequency.value = 3000;
    
          noiseSrc.connect(filter);
          filter.connect(filter2);
          filter2.connect(masterGain);
          
          // Lower volume for background wind
          const bgGain = ctx.createGain();
          bgGain.gain.value = 0.3;
          filter2.disconnect();
          filter2.connect(bgGain);
          bgGain.connect(masterGain);
    
          noiseSrc.start();
    
          // Procedural Bird Chirps
          const chirp = () => {
            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
            
            const osc = ctx.createOscillator();
            const birdGain = ctx.createGain();
            
            osc.connect(birdGain);
            birdGain.connect(masterGain);
            
            const now = ctx.currentTime;
            // Random start freq between 1500-2500
            const startFreq = 1500 + Math.random() * 1000;
            osc.frequency.setValueAtTime(startFreq, now);
            // Chirp up or down
            osc.frequency.exponentialRampToValueAtTime(startFreq + (Math.random() > 0.5 ? 500 : -300), now + 0.1);
            
            birdGain.gain.setValueAtTime(0, now);
            birdGain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            birdGain.gain.linearRampToValueAtTime(0, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.2);
            
            // Schedule next chirp
            birdTimeoutRef.current = setTimeout(chirp, 1000 + Math.random() * 3000);
          };
          chirp();
        }
    } catch (err) {
        console.error("Audio generation failed:", err);
    }
  };

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
        <div className="mt-8 bg-gray-800 text-white p-4 rounded-xl flex items-center justify-between shadow-lg transition-all animate-slide-up">
           <div className="flex items-center gap-3">
             <div className="flex gap-1 items-end h-4">
               <div className="w-1 bg-brand-400 animate-bounce h-2" style={{ animationDuration: '0.6s' }}></div>
               <div className="w-1 bg-brand-400 animate-bounce h-4" style={{ animationDuration: '0.8s' }}></div>
               <div className="w-1 bg-brand-400 animate-bounce h-3" style={{ animationDuration: '0.5s' }}></div>
             </div>
             <span className="text-sm font-medium">Now Playing: {SOUNDS.find(s => s.id === playing)?.name}</span>
           </div>
           <button onClick={() => setPlaying(null)} className="hover:text-brand-300 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700">
             <i className="fa-solid fa-stop text-sm"></i>
           </button>
        </div>
      )}

      <div className="mt-auto pt-8 text-center text-xs text-gray-400">
          <p>Sounds are generated in real-time for relaxation.</p>
      </div>
    </div>
  );
};

export default SleepSoundsTool;
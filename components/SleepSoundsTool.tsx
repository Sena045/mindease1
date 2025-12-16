import React, { useState, useEffect, useRef } from 'react';

const SOUNDS = [
  { id: 'rain', name: 'Gentle Rain', icon: 'fa-cloud-rain', color: 'bg-blue-100 text-blue-600' },
  { id: 'forest', name: 'Forest Birds', icon: 'fa-tree', color: 'bg-green-100 text-green-600' },
  { id: 'waves', name: 'Ocean Waves', icon: 'fa-water', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'white', name: 'Deep Focus (Fan)', icon: 'fa-fan', color: 'bg-gray-100 text-gray-600' },
];

const SleepSoundsTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [playing, setPlaying] = useState<string | null>(null);
  
  // Persistent refs for the single audio context strategy
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]); // Track nodes to stop them properly
  const birdTimeoutRef = useRef<any>(null);

  // Initialize or get persistent audio context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
        }
    }
    // Resume if suspended (browser autoplay policy)
    if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  // Stop all currently playing nodes
  const stopCurrentSound = () => {
    // 1. Clear timeouts
    if (birdTimeoutRef.current) {
        clearTimeout(birdTimeoutRef.current);
        birdTimeoutRef.current = null;
    }

    // 2. Fade out
    if (gainNodeRef.current && audioCtxRef.current) {
        try {
            // Prevent clicking noise with rapid ramp down
            gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.05);
        } catch(e) {}
    }

    // 3. Disconnect and stop nodes after short delay for fade
    // We snapshot the nodes to stop because the ref will be cleared for next sound
    const nodesToStop = [...sourceNodesRef.current];
    sourceNodesRef.current = [];

    setTimeout(() => {
        nodesToStop.forEach(node => {
            try {
                if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
                    node.stop();
                }
                node.disconnect();
            } catch(e) {}
        });
    }, 200);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        stopCurrentSound();
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(e => console.error(e));
        }
    };
  }, []);

  // Handle sound changes
  useEffect(() => {
    stopCurrentSound();

    if (playing) {
      // Small delay to allow fade out of previous track
      const timer = setTimeout(() => {
          playAudio(playing);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [playing]);

  // --- NOISE GENERATORS ---
  const createPinkNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; 
        b6 = white * 0.115926;
    }
    return buffer;
  };

  const createBrownNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; 
    }
    return buffer;
  };

  const playAudio = (type: string) => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
    
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1); 
        
        // Track the gain node too so we can disconnect it
        sourceNodesRef.current.push(masterGain);
    
        if (type === 'white') {
          const buffer = createBrownNoiseBuffer(ctx);
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 40;
          
          src.connect(filter);
          filter.connect(masterGain);
          src.start();
          
          sourceNodesRef.current.push(src, filter);
          
        } else if (type === 'rain') {
          const buffer = createPinkNoiseBuffer(ctx);
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 800; 
          
          src.connect(filter);
          filter.connect(masterGain);
          src.start();

          sourceNodesRef.current.push(src, filter);

        } else if (type === 'waves') {
          const buffer = createBrownNoiseBuffer(ctx);
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.loop = true;
    
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.Q.value = 0; 
    
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.15; 
    
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 400; 
    
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          filter.frequency.setValueAtTime(350, ctx.currentTime); 
    
          src.connect(filter);
          filter.connect(masterGain);
    
          src.start();
          lfo.start();
          
          sourceNodesRef.current.push(src, filter, lfo, lfoGain);
          
        } else if (type === 'forest') {
          const buffer = createPinkNoiseBuffer(ctx);
          const windSrc = ctx.createBufferSource();
          windSrc.buffer = buffer;
          windSrc.loop = true;
    
          const windFilter = ctx.createBiquadFilter();
          windFilter.type = 'lowpass';
          windFilter.frequency.value = 300; 
          
          const windGain = ctx.createGain();
          windGain.gain.value = 0.3; 

          windSrc.connect(windFilter);
          windFilter.connect(windGain);
          windGain.connect(masterGain);
          windSrc.start();
          
          sourceNodesRef.current.push(windSrc, windFilter, windGain);
    
          const chirp = () => {
            if (!ctx || ctx.state === 'closed' || !gainNodeRef.current) return;
            
            const osc = ctx.createOscillator();
            const birdGain = ctx.createGain();
            
            osc.connect(birdGain);
            birdGain.connect(masterGain);
            
            const now = ctx.currentTime;
            const startFreq = 2000 + Math.random() * 1500;
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.linearRampToValueAtTime(startFreq + (Math.random() > 0.5 ? 500 : -200), now + 0.1);
            
            birdGain.gain.setValueAtTime(0, now);
            birdGain.gain.linearRampToValueAtTime(0.05, now + 0.02);
            birdGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.2);
            
            // Clean up these transient nodes manually after they play
            osc.onended = () => {
                osc.disconnect();
                birdGain.disconnect();
            };
            
            birdTimeoutRef.current = setTimeout(chirp, 800 + Math.random() * 4000);
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
          <p>Sounds are synthesized in real-time for maximum relaxation.</p>
      </div>
    </div>
  );
};

export default SleepSoundsTool;
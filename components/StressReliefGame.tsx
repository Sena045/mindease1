import React, { useState, useEffect, useRef } from 'react';

type GameMode = 'menu' | 'bubble' | 'balloons';

const StressReliefGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<GameMode>('menu');

  // --- AUDIO ENGINE (Synthetic, no assets needed) ---
  const playSound = (type: 'pop' | 'balloon') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'pop') {
        // Short, high-pitch pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else {
        // Rubber band snap sound for balloons
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // --- SUB-COMPONENT: BUBBLE POP ---
  const BubblePop = () => {
    const [bubbles, setBubbles] = useState<boolean[]>(Array(30).fill(false));

    const popBubble = (index: number) => {
      if (bubbles[index]) return; // Already popped
      playSound('pop');
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
      
      const newBubbles = [...bubbles];
      newBubbles[index] = true;
      setBubbles(newBubbles);
    };

    const reset = () => {
      setBubbles(Array(30).fill(false));
    };

    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in">
        <h3 className="text-xl font-bold text-brand-700 mb-6">Mind Pop</h3>
        
        <div className="grid grid-cols-5 gap-3 p-4 bg-brand-50 rounded-2xl shadow-inner border border-brand-100">
          {bubbles.map((isPopped, i) => (
            <button
              key={i}
              onPointerDown={() => popBubble(i)}
              className={`w-12 h-12 rounded-full shadow-sm transition-all duration-200 relative
                ${isPopped 
                  ? 'bg-brand-200 shadow-inner scale-95' 
                  : 'bg-gradient-to-br from-brand-400 to-brand-600 shadow-md hover:scale-105 active:scale-90'}
              `}
            >
              {/* Highlight reflection for 3D effect */}
              {!isPopped && <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-40 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
            <button onClick={reset} className="px-6 py-2 bg-white text-brand-600 border border-brand-200 rounded-full font-semibold shadow-sm hover:bg-brand-50">
                <i className="fa-solid fa-rotate-right mr-2"></i> Reset
            </button>
        </div>
      </div>
    );
  };

  // --- SUB-COMPONENT: BALLOON BREAKER ---
  const BalloonBreaker = () => {
    // Balloon type: id, x (%), speed, color, popped
    const [balloons, setBalloons] = useState<any[]>([]);
    const reqRef = useRef<number | null>(null);
    const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-purple-400', 'bg-green-400'];

    useEffect(() => {
        // Spawn balloons periodically
        const interval = setInterval(() => {
            if (Math.random() > 0.3) return; // Random spawn chance
            const id = Date.now();
            const x = Math.random() * 80 + 10; // 10% to 90% width
            const speed = Math.random() * 0.5 + 0.2;
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            
            setBalloons(prev => {
                if (prev.length > 10) return prev; // Limit active balloons
                return [...prev, { id, x, y: 110, speed, color, popped: false }];
            });
        }, 800);

        // Animation Loop
        const animate = () => {
            setBalloons(prev => 
                prev
                .map(b => ({ ...b, y: b.y - b.speed })) // Move up
                .filter(b => b.y > -20 && !b.popped) // Remove if off screen or popped (delayed removal handled in click)
            );
            reqRef.current = requestAnimationFrame(animate);
        };
        reqRef.current = requestAnimationFrame(animate);

        return () => {
            clearInterval(interval);
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, []);

    const popBalloon = (id: number) => {
        playSound('balloon');
        if (navigator.vibrate) navigator.vibrate(20);
        
        // Remove immediately for snappier feel
        setBalloons(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-sky-50 rounded-xl border border-sky-100 touch-none">
            <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none">
                <h3 className="text-xl font-bold text-sky-700/50">Tap to release thoughts</h3>
            </div>
            
            {balloons.map(b => (
                <button
                    key={b.id}
                    onPointerDown={() => popBalloon(b.id)}
                    style={{ left: `${b.x}%`, top: `${b.y}%` }}
                    className={`absolute w-16 h-20 rounded-[50%] ${b.color} shadow-lg opacity-90 transition-transform active:scale-150 active:opacity-0 cursor-pointer flex items-center justify-center`}
                >
                    <div className="absolute bottom-[-10px] w-1 h-8 bg-gray-400/30"></div>
                    <div className="w-4 h-8 bg-white/30 rounded-[50%] absolute top-2 right-3 rotate-12"></div>
                </button>
            ))}
        </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
            <button onClick={mode === 'menu' ? onClose : () => setMode('menu')} className="text-gray-500 hover:text-brand-600 font-medium">
                <i className={`fa-solid ${mode === 'menu' ? 'fa-arrow-left' : 'fa-chevron-left'} mr-2`}></i>
                {mode === 'menu' ? 'Back' : 'Games'}
            </button>
            <h2 className="font-bold text-gray-800">Stress Relief</h2>
            <div className="w-10"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
            {mode === 'menu' && (
                <div className="grid grid-cols-1 gap-4 mt-4 animate-fade-in">
                    <button 
                        onClick={() => setMode('bubble')}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-left flex items-center gap-4 group"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                             <div className="grid grid-cols-2 gap-1">
                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                             </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">Mind Pop</h3>
                            <p className="text-sm text-gray-500">Digital bubble wrap. Endless, satisfying sensory distraction.</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setMode('balloons')}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-left flex items-center gap-4 group"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                             <i className="fa-solid fa-balloon text-sky-500 text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">Thought Breaker</h3>
                            <p className="text-sm text-gray-500">Tap floating balloons to pop away stressful thoughts.</p>
                        </div>
                    </button>
                </div>
            )}

            {mode === 'bubble' && <BubblePop />}
            {mode === 'balloons' && <BalloonBreaker />}
        </div>
    </div>
  );
};

export default StressReliefGame;
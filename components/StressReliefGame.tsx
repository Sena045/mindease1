import React, { useState, useEffect, useRef } from 'react';

type GameMode = 'menu' | 'bubble' | 'balloons' | 'memory';

const StressReliefGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<GameMode>('menu');
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context once
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  // --- AUDIO ENGINE (Optimized) ---
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

  const playSound = (type: 'pop' | 'balloon' | 'flip' | 'match') => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      
      // Pitch Randomization to reduce ear fatigue
      const detune = (Math.random() - 0.5) * 200;
      osc.detune.value = detune;
      
      // Explicit cleanup to avoid memory leaks on rapid fire
      osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
      };

      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'balloon') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'match') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
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
      if (navigator.vibrate) navigator.vibrate(50);
      
      const newBubbles = [...bubbles];
      newBubbles[index] = true;
      setBubbles(newBubbles);
    };

    const reset = () => {
      setBubbles(Array(30).fill(false));
    };

    const allPopped = bubbles.every(b => b);

    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in relative">
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
              {!isPopped && <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-40 rounded-full"></div>}
            </button>
          ))}
        </div>

        {allPopped && (
           <div className="mt-4 text-brand-600 font-bold animate-bounce">
              All cleared! Feels good, right?
           </div>
        )}

        <div className="mt-8">
            <button onClick={reset} className="px-6 py-2 bg-white text-brand-600 border border-brand-200 rounded-full font-semibold shadow-sm hover:bg-brand-50 transition-colors">
                <i className="fa-solid fa-rotate-right mr-2"></i> Reset
            </button>
        </div>
      </div>
    );
  };

  // --- SUB-COMPONENT: BALLOON BREAKER ---
  const BalloonBreaker = () => {
    const [balloons, setBalloons] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const reqRef = useRef<number | null>(null);
    const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-purple-400', 'bg-green-400'];

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.4) return;
            const id = Date.now() + Math.random(); // Ensure unique ID even on rapid ticks
            const x = Math.random() * 80 + 10; 
            const speed = Math.random() * 0.4 + 0.2;
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            
            setBalloons(prev => {
                if (prev.length > 12) return prev; 
                return [...prev, { id, x, y: 110, speed, color, popped: false }];
            });
        }, 800);

        const animate = () => {
            setBalloons(prev => 
                prev
                .map(b => ({ ...b, y: b.y - b.speed })) 
                .filter(b => b.y > -20 && !b.popped)
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
        setScore(s => s + 1);
        if (navigator.vibrate) navigator.vibrate(20);
        setBalloons(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-sky-50 rounded-xl border border-sky-100 touch-none">
            <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none flex flex-col items-center">
                <h3 className="text-xl font-bold text-sky-800/60">Tap to release thoughts</h3>
                <div className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full mt-2 shadow-sm border border-sky-100">
                   <span className="text-sky-600 font-bold text-sm">Score: {score}</span>
                </div>
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

  // --- SUB-COMPONENT: MEMORY MATCH ---
  const MemoryGame = () => {
    const ICONS = ['fa-leaf', 'fa-cloud', 'fa-star', 'fa-heart', 'fa-moon', 'fa-sun'];
    
    // Create deck: 6 pairs = 12 cards
    const createDeck = () => {
        const deck = [...ICONS, ...ICONS]
            .sort(() => Math.random() - 0.5)
            .map((icon, index) => ({ id: index, icon, isFlipped: false, isMatched: false }));
        return deck;
    };

    const [cards, setCards] = useState(createDeck());
    const [flipped, setFlipped] = useState<number[]>([]);
    const [disabled, setDisabled] = useState(false);

    const handleCardClick = (id: number) => {
        if (disabled) return;
        const currentCard = cards.find(c => c.id === id);
        if (!currentCard || currentCard.isFlipped || currentCard.isMatched) return;

        playSound('flip');

        // Flip logic
        const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
        setCards(newCards);
        
        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setDisabled(true);
            const [firstId, secondId] = newFlipped;
            const firstCard = newCards.find(c => c.id === firstId);
            const secondCard = newCards.find(c => c.id === secondId);

            if (firstCard?.icon === secondCard?.icon) {
                // Match
                setTimeout(() => {
                    playSound('match');
                    setCards(prev => prev.map(c => 
                        (c.id === firstId || c.id === secondId) 
                        ? { ...c, isMatched: true } 
                        : c
                    ));
                    setFlipped([]);
                    setDisabled(false);
                }, 500);
            } else {
                // No Match
                setTimeout(() => {
                    setCards(prev => prev.map(c => 
                        (c.id === firstId || c.id === secondId) 
                        ? { ...c, isFlipped: false } 
                        : c
                    ));
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        }
    };

    const reset = () => {
        setCards(createDeck());
        setFlipped([]);
        setDisabled(false);
    };

    const isComplete = cards.every(c => c.isMatched);

    return (
        <div className="flex flex-col items-center h-full animate-fade-in relative max-w-sm mx-auto">
            <h3 className="text-xl font-bold text-emerald-700 mb-6">Focus Match</h3>
            
            <div className="grid grid-cols-3 gap-3 w-full">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-300 transform
                            ${card.isFlipped || card.isMatched 
                                ? 'bg-white border-2 border-emerald-200 rotate-y-180' 
                                : 'bg-emerald-600 border-2 border-emerald-700 shadow-md hover:bg-emerald-500'}
                        `}
                    >
                        {(card.isFlipped || card.isMatched) ? (
                            <i className={`fa-solid ${card.icon} text-emerald-600 animate-fade-in`}></i>
                        ) : (
                            <i className="fa-solid fa-anchor text-emerald-800/20 text-xl"></i>
                        )}
                    </button>
                ))}
            </div>

            {isComplete && (
               <div className="mt-6 text-emerald-600 font-bold animate-bounce text-center">
                  <p>Sharp mind!</p>
                  <button onClick={reset} className="mt-2 text-sm bg-emerald-100 px-4 py-2 rounded-full hover:bg-emerald-200">
                      Play Again
                  </button>
               </div>
            )}
            
            {!isComplete && (
                <button onClick={reset} className="mt-8 text-sm text-gray-400 hover:text-gray-600 flex items-center">
                    <i className="fa-solid fa-rotate-right mr-2"></i> Restart
                </button>
            )}
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
        <div className="flex-1 overflow-hidden overflow-y-auto pb-8">
            {mode === 'menu' && (
                <div className="grid grid-cols-1 gap-4 mt-2 animate-fade-in">
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

                    <button 
                        onClick={() => setMode('memory')}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left flex items-center gap-4 group"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                             <i className="fa-solid fa-brain text-emerald-500 text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">Focus Match</h3>
                            <p className="text-sm text-gray-500">Find the pairs. A gentle memory exercise to regain focus.</p>
                        </div>
                    </button>
                </div>
            )}

            {mode === 'bubble' && <BubblePop />}
            {mode === 'balloons' && <BalloonBreaker />}
            {mode === 'memory' && <MemoryGame />}
        </div>
    </div>
  );
};

export default StressReliefGame;
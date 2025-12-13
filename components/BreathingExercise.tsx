import React, { useState, useEffect } from 'react';

const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);

  // 4-7-8 Pattern
  const INHALE_TIME = 4;
  const HOLD_TIME = 7;
  const EXHALE_TIME = 8;

  const INSTRUCTIONS = {
    Ready: "Sit comfortably and relax your shoulders.",
    Inhale: "Breathe in deeply through your nose...",
    Hold: "Hold your breath gently...",
    Exhale: "Exhale slowly through your mouth..."
  };

  useEffect(() => {
    let interval: any;

    if (isActive) {
      if (timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        // Transition phases
        if (phase === 'Ready' || phase === 'Exhale') {
          setPhase('Inhale');
          setTimeLeft(INHALE_TIME);
          if (phase === 'Exhale') setCycles(c => c + 1);
        } else if (phase === 'Inhale') {
          setPhase('Hold');
          setTimeLeft(HOLD_TIME);
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          setTimeLeft(EXHALE_TIME);
        }
      }
    } else {
      setPhase('Ready');
      setTimeLeft(0);
      setCycles(0);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase]);

  const toggleSession = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="mb-10 relative">
         {/* Visual Circle */}
         <div 
           className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-[1000ms] ease-in-out relative shadow-xl
             ${phase === 'Inhale' ? 'bg-brand-100 scale-110 shadow-brand-200' : 
               phase === 'Hold' ? 'bg-brand-200 scale-110 shadow-brand-300' : 
               phase === 'Exhale' ? 'bg-brand-50 scale-90 shadow-brand-100' : 'bg-gray-100 scale-100'}
           `}
         >
            <div className={`w-48 h-48 rounded-full bg-white flex flex-col items-center justify-center shadow-inner z-10 transition-transform duration-[4000ms]
              ${phase === 'Inhale' ? 'scale-100' : 'scale-95'}
            `}>
              <p className="text-3xl font-bold text-brand-700 transition-all duration-300">
                {phase === 'Ready' ? 'Start' : phase}
              </p>
              {isActive && (
                <p className="text-5xl font-light text-brand-900 mt-2 font-mono">{timeLeft}</p>
              )}
            </div>
            
            {/* Pulsing rings */}
            {isActive && (
              <div className={`absolute inset-0 rounded-full border-4 border-brand-200 opacity-50 
                ${phase === 'Inhale' ? 'animate-ping' : ''}`}></div>
            )}
         </div>
      </div>

      <div className="h-12 mb-6">
        <p className={`text-lg font-medium text-gray-700 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
          {INSTRUCTIONS[phase]}
        </p>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={toggleSession}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-md transform active:scale-95
            ${isActive 
              ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50' 
              : 'bg-brand-600 text-white hover:bg-brand-700'}
          `}
        >
          {isActive ? 'Stop Session' : 'Begin Breathing'}
        </button>

        <button 
          onClick={onClose}
          className="w-full py-3 text-gray-500 text-sm hover:text-gray-800"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to Tools
        </button>
      </div>

      <div className="mt-8 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-lg">
        <span className="font-bold">Technique:</span> 4-7-8 Pattern. Helps activate the parasympathetic nervous system to reduce stress.
      </div>
    </div>
  );
};

export default BreathingExercise;
import React, { useState } from 'react';
import BreathingExercise from './BreathingExercise';
import JournalTool from './JournalTool';
import SleepSoundsTool from './SleepSoundsTool';
import GroundingExercise from './GroundingExercise';

interface WellnessToolsProps {
  isPremium: boolean;
  onUnlock: () => void;
}

const WellnessTools: React.FC<WellnessToolsProps> = ({ isPremium, onUnlock }) => {
  const [activeTool, setActiveTool] = useState<'none' | 'breathing' | 'journal' | 'sleep' | 'grounding'>('none');

  if (activeTool === 'breathing') {
    return <BreathingExercise onClose={() => setActiveTool('none')} />;
  }

  if (activeTool === 'journal') {
    return <JournalTool onClose={() => setActiveTool('none')} />;
  }

  if (activeTool === 'sleep') {
    return <SleepSoundsTool onClose={() => setActiveTool('none')} />;
  }
  
  if (activeTool === 'grounding') {
    return <GroundingExercise onClose={() => setActiveTool('none')} />;
  }

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto pb-24">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-800">Wellness Tools</h2>
        <p className="text-gray-500 text-sm">Interactive tools to help you cope and thrive.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Breathing Tool Card */}
        <div 
          onClick={() => setActiveTool('breathing')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-wind text-blue-600 text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Breathing Exercise</h3>
          <p className="text-sm text-gray-500 mb-4">
            Reduce anxiety instantly with the 4-7-8 rhythmic breathing technique.
          </p>
          <span className="text-blue-600 text-sm font-semibold flex items-center">
            Start Session <i className="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
          </span>
        </div>

        {/* Grounding Tool Card (NEW) */}
        <div 
          onClick={() => setActiveTool('grounding')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-anchor text-emerald-600 text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">5-4-3-2-1 Grounding</h3>
          <p className="text-sm text-gray-500 mb-4">
            A 5-step sensory technique to regain control during high stress or panic.
          </p>
          <span className="text-emerald-600 text-sm font-semibold flex items-center">
            Start Exercise <i className="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
          </span>
        </div>

        {/* Journal Tool Card */}
        <div 
          onClick={() => setActiveTool('journal')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-pen-fancy text-purple-600 text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Daily Journal</h3>
          <p className="text-sm text-gray-500 mb-4">
            Clear your mind. Write down your thoughts with daily prompts.
          </p>
          <span className="text-purple-600 text-sm font-semibold flex items-center">
            Open Journal <i className="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
          </span>
        </div>

        {/* Sleep Sounds Card (Premium) */}
        <div 
          onClick={() => isPremium ? setActiveTool('sleep') : onUnlock()}
          className={`p-6 rounded-2xl border transition-all relative overflow-hidden group 
            ${!isPremium 
              ? 'bg-gray-50 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100' 
              : 'bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer'}`}
        >
          {!isPremium && (
            <div className="absolute top-3 right-3">
              <i className="fa-solid fa-lock text-gray-400"></i>
            </div>
          )}
          
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110
            ${!isPremium ? 'bg-gray-200 grayscale opacity-50' : 'bg-indigo-100'}`}>
            <i className={`fa-solid fa-music text-xl ${!isPremium ? 'text-gray-600' : 'text-indigo-600'}`}></i>
          </div>
          
          <h3 className={`text-lg font-bold mb-1 ${!isPremium ? 'text-gray-400' : 'text-gray-800'}`}>Sleep Sounds</h3>
          <p className={`text-sm mb-4 ${!isPremium ? 'text-gray-400' : 'text-gray-500'}`}>
            Rain, Forest, and White Noise to help you drift off.
          </p>
          
          {!isPremium ? (
             <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">
               Unlock with Premium
             </span>
          ) : (
             <span className="text-indigo-600 text-sm font-semibold flex items-center">
               Play Sounds <i className="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
             </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WellnessTools;
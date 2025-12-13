import React, { useState } from 'react';

const STEPS = [
  {
    count: 5,
    title: "Things you see",
    desc: "Look around you. Notice 5 details you haven't noticed before.",
    icon: "fa-eye",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    count: 4,
    title: "Things you can touch",
    desc: "Notice the sensation of your clothes, the chair, or the table.",
    icon: "fa-hand-pointer",
    color: "text-green-500",
    bg: "bg-green-50"
  },
  {
    count: 3,
    title: "Things you hear",
    desc: "Listen carefully. Distant traffic? A bird? The hum of AC?",
    icon: "fa-ear-listen",
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    count: 2,
    title: "Things you can smell",
    desc: "Or 2 smells you like (coffee, rain). If not, recall a favorite scent.",
    icon: "fa-wind",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    count: 1,
    title: "Thing you can taste",
    desc: "Or one good thing about yourself.",
    icon: "fa-heart",
    color: "text-red-500",
    bg: "bg-red-50"
  }
];

const GroundingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col h-full max-w-lg mx-auto p-8 items-center justify-center text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <i className="fa-solid fa-check text-4xl text-green-600"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Well Done</h2>
        <p className="text-gray-600 mb-8">
          You've completed the grounding exercise. Take this sense of calm with you.
        </p>
        <button 
          onClick={onClose}
          className="bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-brand-700 transition-colors"
        >
          Finish
        </button>
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-brand-500' : 'bg-gray-200'}`} 
            />
          ))}
        </div>
        <div className="w-5"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 ${current.bg}`}>
          <i className={`fa-solid ${current.icon} text-5xl ${current.color}`}></i>
        </div>
        
        <div className="space-y-2 animate-fade-in">
           <h1 className="text-6xl font-bold text-gray-800">{current.count}</h1>
           <h2 className="text-xl font-bold text-gray-700">{current.title}</h2>
           <p className="text-gray-500 max-w-xs mx-auto text-lg leading-relaxed">
             {current.desc}
           </p>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button 
          onClick={handleNext}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95"
        >
          {step === STEPS.length - 1 ? 'Finish' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default GroundingExercise;
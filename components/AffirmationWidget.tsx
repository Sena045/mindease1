import React, { useState, useEffect } from 'react';
import { AFFIRMATIONS } from '../constants';

const AffirmationWidget: React.FC = () => {
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    // Pick a random affirmation on mount
    const random = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setAffirmation(random);
  }, []);

  return (
    <div className="mx-4 mt-4 mb-2 p-4 bg-gradient-to-r from-brand-50 to-white rounded-xl border border-brand-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <i className="fa-solid fa-quote-right text-4xl text-brand-600"></i>
      </div>
      <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Daily Affirmation</p>
      <p className="text-gray-800 font-medium italic text-sm md:text-base">"{affirmation}"</p>
    </div>
  );
};

export default AffirmationWidget;
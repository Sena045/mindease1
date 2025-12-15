import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MoodEntry } from '../types';

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

interface MoodTrackerProps {
  isPremium: boolean;
  onUnlock: () => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ isPremium, onUnlock }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  // Helper to get local YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mood_entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      
      // Check if logged today (using local time logic)
      const today = getLocalDateString();
      const found = parsed.find((e: MoodEntry) => e.date.startsWith(today));
      if (found) setHasLoggedToday(true);
    }
  }, []);

  const handleSave = () => {
    if (!selectedMood) return;

    // Use local time for the date string to ensure consistency
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISO = new Date(now.getTime() - offset).toISOString();

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      score: selectedMood,
      note: note,
      date: localISO,
    };

    const updated = [...entries, newEntry];
    // Keep last 30 entries for history
    if (updated.length > 30) updated.shift();

    setEntries(updated);
    localStorage.setItem('mood_entries', JSON.stringify(updated));
    setHasLoggedToday(true);
    setNote('');
    setSelectedMood(null);
  };

  // Prepare data for chart
  const chartData = entries.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    score: e.score
  }));

  // Calculate Insight strictly for past 7 days
  const getWeeklyInsight = () => {
    if (entries.length === 0) return null;

    const today = new Date();
    // Set end of today
    today.setHours(23, 59, 59, 999);
    
    const oneWeekAgo = new Date();
    // Set start of 7 days ago
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    // Filter entries that fall within the last 7 days
    const recentEntries = entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate >= oneWeekAgo && entryDate <= today;
    });

    if (recentEntries.length < 2) return null; // Need at least a couple of data points for a meaningful insight

    const scores = recentEntries.map(e => e.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    
    if (avg >= 4) return { 
        text: "You've had a generally positive week! Your mood has been consistently high. Keep engaging in activities that bring you joy.", 
        color: "bg-green-50 text-green-800 border-green-200", 
        icon: "fa-star" 
    };
    if (avg >= 3) return { 
        text: "Your mood has been relatively stable this week. Routine and balance are key drivers for this consistency.", 
        color: "bg-blue-50 text-blue-800 border-blue-200", 
        icon: "fa-scale-balanced" 
    };
    if (avg >= 2) return {
        text: "It seems like a mixed week with some ups and downs. Reflect on what triggered the lower moments.",
        color: "bg-yellow-50 text-yellow-800 border-yellow-200",
        icon: "fa-cloud-sun"
    }
    return { 
        text: "It's been a tough week. It's okay to not be okay. Consider practicing the breathing exercises or reaching out to a friend.", 
        color: "bg-orange-50 text-orange-800 border-orange-200", 
        icon: "fa-heart-crack" 
    };
  };

  const insight = getWeeklyInsight();

  // Stats Logic
  const totalEntries = entries.length;
  const avgMood = totalEntries > 0 
    ? (entries.reduce((a, b) => a + b.score, 0) / totalEntries).toFixed(1) 
    : '-';
  const bestDay = totalEntries > 0
    ? entries.reduce((prev, current) => (prev.score > current.score) ? prev : current).score
    : '-';

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24 animate-fade-in">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800">Mood Tracker</h2>
      
      {/* Log Input */}
      {!hasLoggedToday ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">How are you feeling today?</h3>
          
          <div className="flex justify-between mb-6">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  selectedMood === m.value 
                    ? 'bg-brand-100 border-2 border-brand-700 scale-110' 
                    : 'hover:bg-gray-50 border-2 border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-xs font-medium text-gray-600">{m.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a short note (optional)..."
            className="w-full p-3 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-brand-600 mb-4"
            rows={2}
          />

          <button
            onClick={handleSave}
            disabled={!selectedMood}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedMood 
                ? 'bg-brand-700 text-white hover:bg-brand-800 shadow-lg shadow-brand-500/30' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Log Mood
          </button>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <i className="fa-solid fa-check text-green-700"></i>
          </div>
          <div>
            <p className="font-medium text-green-900">Check-in complete!</p>
            <p className="text-xs text-green-700">You've tracked your mood for today.</p>
          </div>
        </div>
      )}

      {/* Chart & Insights */}
      {entries.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Your Journey</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Last {entries.length} entries</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 10}} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  domain={[1, 5]} 
                  hide={true} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0f766e" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#0f766e", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Weekly Insight (PREMIUM FEATURE) */}
          <div className="mt-6 pt-6 border-t border-gray-100">
             {insight ? (
                <div className="relative">
                   {isPremium ? (
                      <div className={`p-4 rounded-xl border ${insight.color} flex gap-3 items-start animate-fade-in`}>
                          <div className="mt-1 bg-white/50 p-2 rounded-full w-8 h-8 flex items-center justify-center">
                              <i className={`fa-solid ${insight.icon}`}></i>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Weekly Insight</p>
                            <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
                          </div>
                      </div>
                   ) : (
                      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                         {/* Blurred Content Placeholder */}
                         <div className="p-4 filter blur-sm opacity-60 select-none">
                            <div className="flex gap-3 items-start">
                              <div className="mt-0.5 w-8 h-8 bg-gray-300 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                 <div className="h-3 bg-gray-300 rounded w-24"></div>
                                 <div className="h-3 bg-gray-300 rounded w-full"></div>
                                 <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                              </div>
                            </div>
                         </div>
                         {/* Lock Overlay */}
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] z-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-2 shadow-sm border border-yellow-100">
                               <i className="fa-solid fa-lock text-yellow-700"></i>
                            </div>
                            <p className="text-sm font-bold text-gray-800">Unlock Weekly Insights</p>
                            <button onClick={onUnlock} className="text-xs text-brand-700 font-semibold mt-1 hover:underline flex items-center">
                              Upgrade to Premium <i className="fa-solid fa-chevron-right text-[10px] ml-1"></i>
                            </button>
                         </div>
                      </div>
                   )}
                </div>
             ) : (
                <div className="text-center p-4 text-gray-400 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                   <p className="text-sm">Log at least 2 days this week to generate an insight.</p>
                </div>
             )}
          </div>
        </div>
      )}
      
      {entries.length === 0 && (
         <div className="text-center text-gray-400 text-sm mt-8 p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
           <i className="fa-solid fa-chart-line text-2xl mb-2 opacity-50"></i>
           <p>Start logging to see your trends over time.</p>
         </div>
      )}

      {/* Analytics Stats */}
      {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Total Logs</span>
                  <span className="text-2xl font-bold text-gray-800">{totalEntries}</span>
              </div>
              
              <div 
                 onClick={!isPremium ? onUnlock : undefined}
                 className={`p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center relative overflow-hidden transition-all ${isPremium ? 'bg-white' : 'bg-gray-50 cursor-pointer hover:border-brand-300'}`}
              >
                  {!isPremium && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                          <i className="fa-solid fa-lock text-gray-400 text-sm"></i>
                      </div>
                  )}
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Avg Mood</span>
                  <span className="text-2xl font-bold text-brand-700">{avgMood}</span>
              </div>

              <div 
                  onClick={!isPremium ? onUnlock : undefined}
                  className={`p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center relative overflow-hidden transition-all ${isPremium ? 'bg-white' : 'bg-gray-50 cursor-pointer hover:border-brand-300'}`}
              >
                   {!isPremium && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                          <i className="fa-solid fa-lock text-gray-400 text-sm"></i>
                      </div>
                  )}
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Best Day</span>
                  <span className="text-2xl font-bold text-green-700">{bestDay === 5 ? '😄' : bestDay === 4 ? '🙂' : bestDay !== '-' ? bestDay : '-'}</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default MoodTracker;
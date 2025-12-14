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
    // Keep last 14 entries for chart simplicity
    if (updated.length > 14) updated.shift();

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

  // Calculate Insight
  // Lowered threshold to 2 so user sees the feature (and its locked state) sooner
  const getWeeklyInsight = () => {
    if (entries.length < 2) return null;
    const scores = entries.map(e => e.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    
    if (avg >= 4) return { text: "You've had a generally positive week! Keep up the good work.", color: "bg-green-50 text-green-700", icon: "fa-star" };
    if (avg >= 3) return { text: "Your mood has been balanced. Routine helps maintain this stability.", color: "bg-blue-50 text-blue-700", icon: "fa-scale-balanced" };
    return { text: "It's been a tough week. Remember to be kind to yourself and take breaks.", color: "bg-orange-50 text-orange-700", icon: "fa-heart" };
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
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
      <h2 className="text-2xl font-bold text-gray-800">Mood Tracker</h2>
      
      {!hasLoggedToday ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">How are you feeling today?</h3>
          
          <div className="flex justify-between mb-6">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  selectedMood === m.value 
                    ? 'bg-brand-50 border-2 border-brand-500 scale-110' 
                    : 'hover:bg-gray-50 border-2 border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-xs font-medium text-gray-500">{m.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a short note (optional)..."
            className="w-full p-3 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-brand-500 mb-4"
            rows={2}
          />

          <button
            onClick={handleSave}
            disabled={!selectedMood}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedMood 
                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Log Mood
          </button>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <i className="fa-solid fa-check text-green-600"></i>
          </div>
          <div>
            <p className="font-medium text-green-800">Check-in complete!</p>
            <p className="text-xs text-green-600">You've tracked your mood for today.</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {entries.length > 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Your Journey</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Last {entries.length} entries</span>
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
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Weekly Insight (PREMIUM FEATURE) */}
          {insight && (
            <div className="mt-6 relative">
              {/* If Premium: Show Content */}
              {isPremium ? (
                <div className={`p-4 rounded-xl ${insight.color} flex gap-3 items-start animate-fade-in`}>
                  <div className="mt-0.5"><i className={`fa-solid ${insight.icon}`}></i></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Weekly Insight</p>
                    <p className="text-sm font-medium">{insight.text}</p>
                  </div>
                </div>
              ) : (
                /* If Free: Show Blurred Lock State */
                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                   <div className="p-4 bg-gray-50 filter blur-sm select-none opacity-50">
                      <div className="flex gap-3 items-start">
                        <div className="mt-0.5 w-4 h-4 bg-gray-300 rounded"></div>
                        <div className="flex-1">
                           <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                           <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                           <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                   </div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-2 shadow-sm">
                         <i className="fa-solid fa-lock text-yellow-600"></i>
                      </div>
                      <p className="text-sm font-bold text-gray-800">Unlock Mood Insights</p>
                      <button onClick={onUnlock} className="text-xs text-brand-600 font-semibold mt-1 hover:underline">
                        Upgrade to Premium
                      </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {entries.length === 0 && (
         <div className="text-center text-gray-400 text-sm mt-8">
           Start logging to see your trends over time.
         </div>
      )}

      {/* NEW SECTION: Mood Analytics Stats */}
      {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Total Logs</span>
                  <span className="text-2xl font-bold text-gray-800">{totalEntries}</span>
              </div>
              
              <div className={`p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden ${isPremium ? 'bg-white' : 'bg-gray-50'}`}>
                  {!isPremium && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <i className="fa-solid fa-lock text-gray-400 text-sm"></i>
                      </div>
                  )}
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Avg Mood</span>
                  <span className="text-2xl font-bold text-brand-600">{avgMood}</span>
              </div>

              <div className={`p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden ${isPremium ? 'bg-white' : 'bg-gray-50'}`}>
                   {!isPremium && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <i className="fa-solid fa-lock text-gray-400 text-sm"></i>
                      </div>
                  )}
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Best Day</span>
                  <span className="text-2xl font-bold text-green-600">{bestDay === 5 ? '😄' : bestDay === 4 ? '🙂' : bestDay !== '-' ? bestDay : '-'}</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default MoodTracker;
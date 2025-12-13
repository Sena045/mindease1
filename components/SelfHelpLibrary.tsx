import React from 'react';
import { SELF_HELP_RESOURCES } from '../constants';

interface SelfHelpLibraryProps {
  isPremium: boolean;
  onUnlock: () => void;
}

const SelfHelpLibrary: React.FC<SelfHelpLibraryProps> = ({ isPremium, onUnlock }) => {
  const [filter, setFilter] = React.useState<string>('All');
  
  const filtered = filter === 'All' 
    ? SELF_HELP_RESOURCES 
    : SELF_HELP_RESOURCES.filter(r => r.category === filter);

  const categories = ['All', 'Anxiety', 'Sleep', 'Mindfulness', 'Depression'];

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-800">Wellness Library</h2>
        {!isPremium && (
          <button onClick={onUnlock} className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow flex items-center gap-1">
            <i className="fa-solid fa-crown text-yellow-600"></i> Go Premium
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === cat 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((resource) => {
          const isLocked = resource.isPremium && !isPremium;
          
          return (
            <div 
              key={resource.id} 
              className={`bg-white p-5 rounded-xl border relative overflow-hidden transition-all ${
                isLocked 
                  ? 'border-gray-200 cursor-pointer hover:border-yellow-400 group' 
                  : 'border-gray-100 shadow-sm hover:shadow-md'
              }`}
              onClick={isLocked ? onUnlock : undefined}
            >
              {/* Lock Overlay for Premium content */}
              {isLocked && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2 shadow-lg scale-90 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-lock text-yellow-600 text-lg"></i>
                  </div>
                  <span className="text-xs font-bold text-gray-800 bg-white px-3 py-1 rounded-full shadow-sm">
                    Unlock Premium
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    resource.category === 'Anxiety' ? 'bg-orange-100 text-orange-700' :
                    resource.category === 'Sleep' ? 'bg-indigo-100 text-indigo-700' :
                    resource.category === 'Depression' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {resource.category}
                  </span>
                  {resource.isPremium && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                      <i className="fa-solid fa-crown mr-1 text-[8px]"></i> PRO
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  <i className="fa-regular fa-clock mr-1"></i>{resource.duration}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-800 text-lg mb-2">{resource.title}</h3>
              
              <div className={`text-sm text-gray-600 mb-4 line-clamp-3 ${isLocked ? 'blur-[1px]' : ''}`}>
                {resource.content}
              </div>

              <button className={`text-sm font-semibold flex items-center ${isLocked ? 'text-gray-400' : 'text-brand-600 hover:text-brand-800'}`}>
                {resource.type === 'audio' ? 'Listen Now' : 'Read More'} 
                <i className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-arrow-right'} ml-2 text-xs`}></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelfHelpLibrary;
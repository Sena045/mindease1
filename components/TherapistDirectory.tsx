import React from 'react';
import { MOCK_THERAPISTS } from '../constants';

const TherapistDirectory: React.FC = () => {
  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto pb-24">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Find a Professional</h2>
        <p className="text-sm text-gray-500 mt-1">Licensed therapists vetted by MindEase.</p>
      </div>

      {/* Search Bar Visual Only */}
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-3.5 text-gray-400"></i>
        <input 
          type="text" 
          placeholder="Search by name, language, or specialization..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 text-sm"
        />
      </div>

      <div className="grid gap-4">
        {MOCK_THERAPISTS.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
            <img 
              src={doc.imageUrl} 
              alt={doc.name} 
              className="w-20 h-20 rounded-full object-cover bg-gray-200"
            />
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{doc.name}</h3>
                  <p className="text-brand-600 text-sm font-medium">{doc.title}</p>
                </div>
                <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                  ₹{doc.fee}/session
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p><i className="fa-solid fa-briefcase mr-1.5"></i> {doc.experience} experience</p>
                <p><i className="fa-solid fa-language mr-1.5"></i> {doc.languages.join(", ")}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.specialization.map(s => (
                    <span key={s} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2 mt-2 sm:mt-0 sm:w-32">
              <p className="text-[10px] text-green-600 text-center font-medium">
                Next: {doc.nextAvailable}
              </p>
              <button className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistDirectory;
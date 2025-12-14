import React from 'react';
import { HELPLINES_BY_REGION } from '../constants';
import { RegionCode } from '../types';

interface CrisisBannerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  region: RegionCode;
}

const CrisisBanner: React.FC<CrisisBannerProps> = ({ isOpen, onOpen, onClose, region }) => {
  // Fallback to GLOBAL if region not found, though types ensure it usually is.
  const lines = HELPLINES_BY_REGION[region] || HELPLINES_BY_REGION['GLOBAL'];

  return (
    <>
      {/* Sticky Header */}
      <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex justify-between items-center sticky top-0 z-50">
        <span className="text-red-800 text-xs md:text-sm font-medium">
          <i className="fa-solid fa-heart-pulse mr-2"></i>
          In distress? You are not alone.
        </span>
        <button
          onClick={onOpen}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-full transition-colors shadow-sm"
        >
          Get Help ({region})
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-red-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Emergency Helplines</h3>
              <button onClick={onClose} className="text-white hover:text-red-100">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                If you are in immediate danger, please visit the nearest hospital or contact these free, confidential helplines for <strong>{region === 'US' ? 'USA' : region === 'IN' ? 'India' : region === 'UK' ? 'UK' : 'your region'}</strong>.
              </p>
              <div className="space-y-3">
                {lines.map((line, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">{line.name}</p>
                      <p className="text-xs text-gray-500">Number: {line.number} • {line.hours}</p>
                    </div>
                    {/* Only show call button if it looks like a phone number (digits > 3) */}
                    {line.number.replace(/\D/g,'').length > 3 && (
                        <a
                        href={`tel:${line.number}`}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                        >
                        <i className="fa-solid fa-phone"></i>
                        </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t">
              Tap the phone icon to call directly.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrisisBanner;
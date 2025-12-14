import React, { useState } from 'react';
import { MOCK_THERAPISTS } from '../constants';

interface TherapistDirectoryProps {
  isPremium?: boolean;
  onClose?: () => void;
}

const TherapistDirectory: React.FC<TherapistDirectoryProps> = ({ isPremium = false, onClose }) => {
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleBookClick = (therapist: any) => {
    setSelectedTherapist(therapist);
    setBookingStep('select');
    setDate('');
    setTime('');
  };

  const confirmBooking = () => {
    setBookingStep('success');
  };

  const closeBooking = () => {
    setSelectedTherapist(null);
    setBookingStep('select');
  };

  // Helper to calculate price
  const getPrice = (originalFee: number) => {
    if (!isPremium) return originalFee;
    return Math.floor(originalFee * 0.85); // 15% discount
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onClose} className="text-gray-500 hover:text-brand-600 font-medium">
           {onClose && <><i className="fa-solid fa-arrow-left mr-2"></i> Back</>}
        </button>
        <h2 className="text-xl font-bold text-gray-800">Therapist Directory</h2>
        <div className="w-10"></div>
      </div>

      {/* Premium Banner inside Directory */}
      {isPremium && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-yellow-100 p-2 rounded-full"><i className="fa-solid fa-crown text-yellow-700"></i></div>
               <div>
                  <p className="text-sm font-bold text-yellow-900">Premium Perks Active</p>
                  <p className="text-xs text-yellow-700">You get 15% off all booking fees.</p>
               </div>
            </div>
        </div>
      )}

      {/* Search Bar Visual Only */}
      <div className="relative mb-4">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-3.5 text-gray-400"></i>
        <input 
          type="text" 
          placeholder="Search by name, language, or specialization..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 text-sm"
        />
      </div>

      <div className="grid gap-4 pb-20 overflow-y-auto">
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
                <div className="text-right">
                  {isPremium ? (
                    <>
                      <div className="text-xs text-gray-400 line-through">₹{doc.fee}</div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                        ₹{getPrice(doc.fee)}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                      ₹{doc.fee}/session
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p><i className="fa-solid fa-briefcase mr-1.5"></i> {doc.experience} experience</p>
                <p><i className="fa-solid fa-language mr-1.5"></i> {doc.languages.join(", ")}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.specialization.map((s: string) => (
                    <span key={s} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2 mt-2 sm:mt-0 sm:w-32">
              <p className="text-[10px] text-green-600 text-center font-medium">
                Next: {doc.nextAvailable}
              </p>
              <button 
                onClick={() => handleBookClick(doc)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedTherapist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md overflow-hidden animate-slide-up md:animate-fade-in shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-brand-50 p-4 border-b border-brand-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">
                {bookingStep === 'success' ? 'Booking Confirmed' : 'Book Appointment'}
              </h3>
              <button onClick={closeBooking} className="text-gray-500 hover:text-gray-800">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {bookingStep === 'success' ? (
                <div className="text-center space-y-4 py-4">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                     <i className="fa-solid fa-check text-2xl text-green-600"></i>
                   </div>
                   <h4 className="text-xl font-bold text-gray-800">You're all set!</h4>
                   <p className="text-gray-600 text-sm">
                     Your appointment with <strong>{selectedTherapist.name}</strong> has been confirmed.
                   </p>
                   <p className="text-xs text-gray-400">A confirmation email has been sent to you.</p>
                   <button 
                     onClick={closeBooking}
                     className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-6"
                   >
                     Done
                   </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <img src={selectedTherapist.imageUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-bold text-gray-900">{selectedTherapist.name}</p>
                      <p className="text-xs text-gray-500">{selectedTherapist.title}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Select Date</label>
                    <input 
                      type="date" 
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-brand-500 focus:outline-none"
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Select Time</label>
                    <select 
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-brand-500 focus:outline-none bg-white"
                      onChange={(e) => setTime(e.target.value)}
                    >
                      <option value="">-- Choose a slot --</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm border border-gray-100">
                    <span className="text-gray-600">Total Fee</span>
                    <div className="text-right">
                       {isPremium && <span className="block text-xs text-gray-400 line-through">₹{selectedTherapist.fee}</span>}
                       <span className="font-bold text-gray-900">₹{getPrice(selectedTherapist.fee)}</span>
                    </div>
                  </div>
                  
                  {isPremium && (
                      <div className="text-[10px] text-green-600 text-center">
                        <i className="fa-solid fa-check mr-1"></i> Premium discount applied
                      </div>
                  )}

                  <button 
                    onClick={confirmBooking}
                    disabled={!date || !time}
                    className={`w-full py-3 rounded-xl font-bold mt-2 transition-colors ${
                      !date || !time 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                    }`}
                  >
                    Confirm & Pay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistDirectory;
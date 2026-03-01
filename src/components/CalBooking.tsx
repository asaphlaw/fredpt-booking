'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CalBookingProps {
  clientId: string;
  isTrial: boolean;
  onBookingComplete: (date: string, time: string) => void;
}

export default function CalBooking({ clientId, isTrial, onBookingComplete }: CalBookingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{date: string; time: string} | null>(null);

  // For MVP, we'll use a simple calendar picker
  // In production, integrate with Cal.com embed
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (optional)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Morning slots
      slots.push({ date: dateStr, time: '09:00', label: '9:00 AM' });
      slots.push({ date: dateStr, time: '10:00', label: '10:00 AM' });
      slots.push({ date: dateStr, time: '11:00', label: '11:00 AM' });
      
      // Afternoon slots
      slots.push({ date: dateStr, time: '14:00', label: '2:00 PM' });
      slots.push({ date: dateStr, time: '15:00', label: '3:00 PM' });
      slots.push({ date: dateStr, time: '16:00', label: '4:00 PM' });
      
      // Evening slots
      slots.push({ date: dateStr, time: '18:00', label: '6:00 PM' });
      slots.push({ date: dateStr, time: '19:00', label: '7:00 PM' });
    }
    
    return slots;
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          date: selectedSlot.date,
          time: selectedSlot.time,
          type: isTrial ? 'trial' : 'regular'
        })
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.redirectToPackages) {
          // Redirect to packages page
          window.location.href = '/packages?clientId=' + clientId;
          return;
        }
        throw new Error(result.error || 'Failed to book');
      }

      onBookingComplete(selectedSlot.date, selectedSlot.time);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const slots = generateTimeSlots();
  const groupedByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">
        {isTrial ? 'Book Your FREE Trial Session' : 'Book Your Session'}
      </h2>
      <p className="text-gray-600 mb-6">
        {isTrial 
          ? 'Select a date and time for your complimentary session.' 
          : 'Select a date and time for your next session.'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {Object.entries(groupedByDate).map(([date, dateSlots]) => (
          <div key={date} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {dateSlots.map(slot => (
                <button
                  key={`${slot.date}-${slot.time}`}
                  onClick={() => setSelectedSlot({ date: slot.date, time: slot.time })}
                  className={`p-2 rounded text-sm transition-colors ${
                    selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedSlot && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">
            Selected: {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })} at {new Date(`2000-01-01T${selectedSlot.time}`).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </p>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="mt-3 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
}

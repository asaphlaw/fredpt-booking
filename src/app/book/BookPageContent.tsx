'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CalBooking from '@/components/CalBooking';

export default function BookPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{date: string; time: string} | null>(null);

  const clientId = searchParams.get('clientId');
  const isTrial = searchParams.get('trial') === 'true';

  useEffect(() => {
    if (!clientId) {
      router.push('/');
      return;
    }

    fetch(`/api/client/${clientId}`)
      .then(res => res.json())
      .then(data => {
        setClientData(data);
        setLoading(false);
      })
      .catch(() => {
        router.push('/');
      });
  }, [clientId, router]);

  const handleBookingComplete = (date: string, time: string) => {
    setBookingDetails({ date, time });
    setConfirmed(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (confirmed && bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">
            {isTrial ? 'Trial Session Booked!' : 'Session Booked!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {new Date(bookingDetails.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })} at {new Date(`2000-01-01T${bookingDetails.time}`).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </p>
          
          {isTrial ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                Looking forward to meeting you! I&apos;ll assess your movement and discuss your goals.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                Sessions remaining: {clientData?.sessions_remaining}
              </p>
            </div>
          )}

          {isTrial && (
            <div className="mt-6">
              <p className="text-gray-500 mb-4">After your trial, you can purchase a package to continue:</p>
              <a 
                href={`/packages?clientId=${clientId}`}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Packages
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <CalBooking 
        clientId={clientId!} 
        isTrial={isTrial}
        onBookingComplete={handleBookingComplete}
      />
    </main>
  );
}

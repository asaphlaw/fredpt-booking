'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPageContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [clientData, setClientData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      Promise.all([
        fetch(`/api/client/${clientId}`).then(r => r.json()),
        fetch(`/api/client/${clientId}/bookings`).then(r => r.json())
      ]).then(([client, bookingsData]) => {
        setClientData(client);
        setBookings(bookingsData.bookings || []);
        setLoading(false);
      });
    }
  }, [clientId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Client not found</p>
          <Link href="/" className="text-blue-600 hover:underline">Start over</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        {/* Session Credits */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Credits</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-blue-600">{clientData.sessions_remaining}</p>
              <p className="text-gray-600">sessions remaining</p>
            </div>
            {clientData.sessions_remaining > 0 ? (
              <a 
                href={`/book?clientId=${clientId}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Book Session
              </a>
            ) : (
              <a 
                href={`/packages?clientId=${clientId}`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Buy Package
              </a>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          {bookings.filter((b: any) => b.status === 'confirmed').length > 0 ? (
            <div className="space-y-3">
              {bookings
                .filter((b: any) => b.status === 'confirmed')
                .map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(`2000-01-01T${booking.time}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.type === 'trial' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.type === 'trial' ? 'Trial' : 'Regular'}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming sessions</p>
          )}
        </div>

        {/* Past Sessions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
          {bookings.filter((b: any) => b.status !== 'confirmed').length > 0 ? (
            <div className="space-y-3">
              {bookings
                .filter((b: any) => b.status !== 'confirmed')
                .slice(0, 5)
                .map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded opacity-60">
                    <div>
                      <p className="font-medium">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{booking.status}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600">No past sessions</p>
          )}
        </div>
      </div>
    </div>
  );
}

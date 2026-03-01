'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/clients').then(r => r.json()),
      fetch('/api/admin/bookings').then(r => r.json())
    ]).then(([clientsData, bookingsData]) => {
      setClients(clientsData.clients || []);
      setBookings(bookingsData.bookings || []);
      setLoading(false);
    });
  }, []);

  const handleAddSessions = async (clientId: string, sessions: number) => {
    await fetch('/api/admin/add-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, sessions })
    });
    // Refresh
    window.location.reload();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Total Clients</p>
          <p className="text-3xl font-bold">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Upcoming Sessions</p>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Trial Pending</p>
          <p className="text-3xl font-bold">
            {clients.filter((c: any) => !c.trial_completed).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Active Packages</p>
          <p className="text-3xl font-bold">
            {clients.filter((c: any) => c.sessions_remaining > 0).length}
          </p>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold p-6 border-b">Upcoming Sessions</h2>
        <div className="divide-y">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{booking.client_name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(booking.date).toLocaleDateString()} at {booking.time}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                booking.type === 'trial' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {booking.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clients */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">All Clients</h2>
        <div className="divide-y">
          {clients.map((client: any) => (
            <div key={client.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-600">{client.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {client.sessions_remaining} sessions
                </span>
                <button
                  onClick={() => {
                    const sessions = prompt('Add how many sessions?');
                    if (sessions) handleAddSessions(client.id, parseInt(sessions));
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add Sessions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

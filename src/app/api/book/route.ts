import { NextRequest, NextResponse } from 'next/server';
import dbClient from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, date, time, type } = body;

    if (!clientId || !date || !time || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await dbClient.getClient(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (type === 'trial' && client.trial_completed) {
      return NextResponse.json({ 
        error: 'Trial already used. Please purchase a package.',
        redirectToPackages: true
      }, { status: 400 });
    }

    if (type === 'regular' && client.sessions_remaining <= 0) {
      return NextResponse.json({ 
        error: 'No sessions remaining. Please purchase a package.',
        redirectToPackages: true
      }, { status: 400 });
    }

    const booking = await dbClient.createBooking(clientId, date, time, type);
    const updatedClient = await dbClient.getClient(clientId);

    return NextResponse.json({ 
      bookingId: booking.id,
      message: type === 'trial' 
        ? 'Trial session booked! See you soon.' 
        : `Session booked! You have ${updatedClient?.sessions_remaining} sessions remaining.`,
      sessionsRemaining: type === 'regular' ? updatedClient?.sessions_remaining : undefined
    });

  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

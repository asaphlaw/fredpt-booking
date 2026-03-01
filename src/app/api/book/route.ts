import { NextRequest, NextResponse } from 'next/server';
import dbClient from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, date, time, type } = body;

    if (!clientId || !date || !time || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = dbClient.getClient(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if trial already used
    if (type === 'trial' && client.trial_completed) {
      return NextResponse.json({ 
        error: 'Trial already used. Please purchase a package.',
        redirectToPackages: true
      }, { status: 400 });
    }

    // Check credits for regular booking
    if (type === 'regular' && client.sessions_remaining <= 0) {
      return NextResponse.json({ 
        error: 'No sessions remaining. Please purchase a package.',
        redirectToPackages: true
      }, { status: 400 });
    }

    // Create booking
    const booking = dbClient.createBooking(clientId, date, time, type);

    return NextResponse.json({ 
      bookingId: booking.id,
      message: type === 'trial' 
        ? 'Trial session booked! See you soon.' 
        : `Session booked! You have ${client.sessions_remaining - 1} sessions remaining.`,
      sessionsRemaining: type === 'regular' ? client.sessions_remaining - 1 : undefined
    });

  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

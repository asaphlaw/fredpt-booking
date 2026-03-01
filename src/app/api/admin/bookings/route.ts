import { NextResponse } from 'next/server';
import dbClient from '@/lib/db';

export async function GET() {
  try {
    const bookings = await dbClient.getUpcomingBookings();
    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

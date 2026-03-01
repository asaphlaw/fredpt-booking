import { NextResponse } from 'next/server';
import dbClient from '@/lib/db';

export async function GET() {
  try {
    const clients = await dbClient.getAllClients();
    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

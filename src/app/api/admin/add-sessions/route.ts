import { NextRequest, NextResponse } from 'next/server';
import dbClient from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { clientId, sessions } = await req.json();
    
    if (!clientId || !sessions) {
      return NextResponse.json({ error: 'Missing clientId or sessions' }, { status: 400 });
    }

    await dbClient.addSessions(clientId, sessions);
    
    return NextResponse.json({ success: true, message: `Added ${sessions} sessions` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

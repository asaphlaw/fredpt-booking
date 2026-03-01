import { NextRequest, NextResponse } from 'next/server';
import dbClient from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, age, height, weight, fitness_goals, experience, injuries, preferred_times } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 });
    }

    // Check if email already exists and has used trial
    const existingClient = dbClient.getClientByEmail(email);
    if (existingClient) {
      if (existingClient.trial_completed) {
        return NextResponse.json({ 
          error: 'You have already used your complimentary trial. Please purchase a package to continue.',
          clientId: existingClient.id,
          hasUsedTrial: true
        }, { status: 400 });
      }
      // Client exists but hasn't completed trial - let them book
      return NextResponse.json({ 
        clientId: existingClient.id,
        message: 'Welcome back! Continue to book your trial.'
      });
    }

    // Create new client
    const client = dbClient.createClient({
      name,
      email,
      phone,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      fitness_goals: fitness_goals?.join(', '),
      experience,
      injuries,
      preferred_times: preferred_times?.join(', ')
    });

    return NextResponse.json({ 
      clientId: client.id,
      message: 'Questionnaire submitted successfully!'
    });

  } catch (error: any) {
    console.error('Questionnaire error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

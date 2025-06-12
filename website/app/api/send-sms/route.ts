import { NextResponse } from 'next/server';
import { SMSRequestSchema } from '@/types/sms';

const SMS_SERVER_URL = process.env.SMS_SERVER_URL || 'http://localhost:3001/webhook/send-sms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = SMSRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: result.error.issues 
      }, { status: 400 });
    }

    // Forward the request to the SMS server
    const response = await fetch(SMS_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result.data)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send SMS');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      error: 'Failed to send SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
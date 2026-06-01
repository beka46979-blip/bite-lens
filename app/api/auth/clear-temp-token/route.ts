import { NextResponse } from 'next/server';
import { clearTempToken } from '@/lib/auth/cookies';

export async function POST() {
  try {
    await clearTempToken();
    
    return NextResponse.json({
      success: true,
      message: 'Temporary token cleared',
    });
  } catch (error) {
    console.error('Clear temp token error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

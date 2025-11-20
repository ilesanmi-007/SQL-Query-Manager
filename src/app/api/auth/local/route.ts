import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, users } = await request.json();

    if (!email || !password || !users) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    console.error('Local auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('accessToken')?.value ||
    cookieStore.get('access_token')?.value;

  try {
    if (token) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
    }
  } catch {
    // Ignore backend logout errors
  }

  const res = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  res.cookies.delete('accessToken');
  res.cookies.delete('access_token');
  res.cookies.delete('refreshToken');
  res.cookies.delete('refresh_token');

  return res;
}

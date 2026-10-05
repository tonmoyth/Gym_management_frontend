import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetch(`${BACKEND_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Verification failed',
          error: data.error,
        },
        { status: backendRes.status }
      );
    }

    const user = data.data;
    const accessToken = data.token;
    const refreshToken = data.refreshToken;

    const res = NextResponse.json({
      success: true,
      message: data.message,
      data: user,
      token: accessToken,
      refreshToken,
    });

    const isProd = process.env.NODE_ENV === 'production';

    if (accessToken) {
      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 2, // 2 days
      });
      // also set access_token for compatibility
      res.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 2,
      });
    }

    if (refreshToken) {
      res.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      res.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Server connection error', error: err.message },
      { status: 500 }
    );
  }
}

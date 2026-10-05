import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

async function forward(req: NextRequest, pathSegments: string[]) {
  const cookieStore = await cookies();
  let accessToken =
    cookieStore.get('accessToken')?.value ||
    cookieStore.get('access_token')?.value;

  const targetPath = pathSegments.join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${targetPath}${search}`;

  const contentType = req.headers.get('content-type') || '';

  const doFetch = async (token?: string) => {
    const headers: Record<string, string> = {};

    if (contentType && !contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = contentType;
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let body: any = undefined;
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (contentType.includes('application/json')) {
        body = await req.text();
      } else if (contentType.includes('multipart/form-data')) {
        body = await req.formData();
      } else {
        body = await req.arrayBuffer();
      }
    }

    return fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });
  };

  let backendRes: Response;
  try {
    backendRes = await doFetch(accessToken);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to connect to backend server', error: err.message },
      { status: 502 }
    );
  }

  // If 401, check if we can refresh
  if (backendRes.status === 401) {
    const refreshToken =
      cookieStore.get('refreshToken')?.value ||
      cookieStore.get('refresh_token')?.value;

    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          accessToken = refreshData.data?.accessToken || refreshData.token;
          backendRes = await doFetch(accessToken);
        }
      } catch {
        // Refresh failed, fall through to 401
      }
    }
  }

  const responseText = await backendRes.text();
  const res = new NextResponse(responseText, {
    status: backendRes.status,
    headers: {
      'Content-Type': backendRes.headers.get('content-type') || 'application/json',
    },
  });

  const isProd = process.env.NODE_ENV === 'production';

  // If logout endpoint called, clear all auth cookies
  if (targetPath === 'auth/logout') {
    res.cookies.delete('accessToken');
    res.cookies.delete('access_token');
    res.cookies.delete('refreshToken');
    res.cookies.delete('refresh_token');
    return res;
  }

  // Check if response contains fresh auth tokens
  let responseAccessToken: string | undefined;
  let responseRefreshToken: string | undefined;

  try {
    const json = JSON.parse(responseText);
    if (json.token || json.accessToken || json.data?.token || json.data?.accessToken) {
      responseAccessToken = json.token || json.accessToken || json.data?.token || json.data?.accessToken;
    }
    if (json.refreshToken || json.data?.refreshToken) {
      responseRefreshToken = json.refreshToken || json.data?.refreshToken;
    }
  } catch {
    // Non-JSON response
  }

  const effectiveAccessToken = responseAccessToken || accessToken;

  if (effectiveAccessToken) {
    res.cookies.set('accessToken', effectiveAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 2, // 2 days
    });
    res.cookies.set('access_token', effectiveAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 2,
    });
  }

  if (responseRefreshToken) {
    res.cookies.set('refreshToken', responseRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    res.cookies.set('refresh_token', responseRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}

type RouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

export async function GET(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  return forward(req, params.path);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  return forward(req, params.path);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  return forward(req, params.path);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  return forward(req, params.path);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  return forward(req, params.path);
}

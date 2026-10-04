import { cookies } from 'next/headers';
import { Role, StaffPermissionRole, User } from '@/types/api.types';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  profileImage?: string | null;
  isVerified?: boolean;
  isOnboarded?: boolean;
  hasBusiness?: boolean;
  isPlatformStaff?: boolean;
  staffRole?: StaffPermissionRole | null;
  staffBusiness?: { id: string; name: string } | null;
  permissions?: string[];
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get('accessToken')?.value ||
    cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (!json.success || !json.data?.user) {
      return null;
    }

    const u = json.data.user;
    return {
      id: u.id,
      fullName: u.fullName || u.name || 'User',
      email: u.email,
      role: u.role as Role,
      profileImage: u.profileImage,
      isVerified: u.isVerified,
      hasBusiness: Boolean(u.hasBusiness ?? (u.ownedBusinesses && u.ownedBusinesses.length > 0)),
      isOnboarded: Boolean(u.isOnboarded ?? u.memberProfile),
      isPlatformStaff: Boolean(
        u.isPlatformStaff ??
        ((u.role === 'STAFF' || u.role === 'ADMIN') && !u.staffBusiness && (!u.staffRoles || u.staffRoles.length === 0))
      ),
      staffRole: u.staffRole || null,
      staffBusiness: u.staffBusiness || null,
      permissions: u.permissions || [],
    };
  } catch (err) {
    console.error('Error fetching session:', err);
    return null;
  }
}

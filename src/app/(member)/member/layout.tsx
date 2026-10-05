import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/getSession';
import { RoleShell } from '@/components/layout/RoleShell';
import {
  LayoutDashboard,
  CalendarCheck,
  QrCode,
  TrendingUp,
  Utensils,
  MessageSquare,
  Heart,
  Gift,
  Bell,
  User,
  Compass,
} from 'lucide-react';

export default async function MemberPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'MEMBER') {
    redirect('/unauthorized');
  }

  // Strict check: un-onboarded members cannot access any member portal routes!
  let isProfileCompleted = session.isOnboarded;
  if (!isProfileCompleted) {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('accessToken')?.value ||
      cookieStore.get('access_token')?.value;

    if (token) {
      try {
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${backendUrl}/members/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (res.ok) {
          isProfileCompleted = true;
        }
      } catch {
        isProfileCompleted = false;
      }
    }
  }

  if (!isProfileCompleted) {
    redirect('/onboarding');
  }

  const memberNavItems = [
    { label: 'Dashboard', href: '/member/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Find Gyms', href: '/member/gyms', icon: <Compass className="w-4 h-4" /> },
    { label: 'My Bookings', href: '/member/bookings', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'Attendance (QR)', href: '/member/attendance', icon: <QrCode className="w-4 h-4" /> },
    { label: 'Fitness Progress', href: '/member/progress', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Diet Plan', href: '/member/diet-plan', icon: <Utensils className="w-4 h-4" /> },
    // { label: 'Chat Support', href: '/member/chat', icon: <MessageSquare className="w-4 h-4" /> }, // Temporarily paused, to be enabled later
    { label: 'Saved Gyms', href: '/member/favorites', icon: <Heart className="w-4 h-4" /> },
    // Referral system temporarily disabled - will be implemented later
    // { label: 'Refer & Earn', href: '/member/referrals', icon: <Gift className="w-4 h-4" /> },
    { label: 'Notifications', href: '/member/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Profile Settings', href: '/member/profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <RoleShell
      user={session}
      roleTitle="Member Portal"
      roleAccent="coral"
      navItems={memberNavItems}
    >
      {children}
    </RoleShell>
  );
}

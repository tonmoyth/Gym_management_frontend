import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/getSession';
import { OwnerShell } from '@/components/layout/OwnerShell';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  CalendarClock,
  Users,
  Award,
  Briefcase,
  QrCode,
  Calendar,
  Wrench,
  Megaphone,
  DollarSign,
  BarChart3,
  Gift,
  UserCheck,
  CreditCard,
  MessageSquare,
  Landmark,
} from 'lucide-react';

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Redirect Super Admin, Admin, and Platform Staff to admin dashboard
  if (
    session.role === 'SUPER_ADMIN' ||
    session.role === 'ADMIN' ||
    session.isPlatformStaff ||
    (session.role === 'STAFF' && !session.staffBusiness)
  ) {
    redirect('/admin/dashboard');
  }

  if (session.role !== 'BUSINESS_OWNER' && session.role !== 'STAFF') {
    redirect('/unauthorized');
  }

  const isOwner = session.role === 'BUSINESS_OWNER';
  const effectiveRole = isOwner ? 'OWNER' : (session.staffRole || 'FULL');

  const allNavItems = [
    { label: 'Overview', href: '/owner/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['OWNER', 'FRONT_DESK', 'MEMBER_MANAGER', 'TRAINER_MANAGER', 'FINANCE', 'FULL'] },
    { label: 'Pending Bookings', href: '/owner/bookings', icon: <CalendarClock className="w-4 h-4" />, roles: ['OWNER', 'MEMBER_MANAGER', 'FULL'] },
    { label: 'Gym Profile', href: '/owner/profile', icon: <Building2 className="w-4 h-4" />, roles: ['OWNER', 'FULL'] },
    { label: 'Membership Plans', href: '/owner/plans', icon: <ShieldCheck className="w-4 h-4" />, roles: ['OWNER', 'MEMBER_MANAGER', 'FULL'] },
    { label: 'Enrolled Members', href: '/owner/members', icon: <Users className="w-4 h-4" />, roles: ['OWNER', 'FRONT_DESK', 'MEMBER_MANAGER', 'FULL'] },
    { label: 'Trainer Roster', href: '/owner/trainers', icon: <Award className="w-4 h-4" />, roles: ['OWNER', 'TRAINER_MANAGER', 'FULL'] },
    { label: 'Job Listings', href: '/owner/job-posts', icon: <Briefcase className="w-4 h-4" />, roles: ['OWNER', 'TRAINER_MANAGER', 'FULL'] },
    { label: 'Attendance & QR', href: '/owner/attendance', icon: <QrCode className="w-4 h-4" />, roles: ['OWNER', 'FRONT_DESK', 'MEMBER_MANAGER', 'FULL'] },
    { label: 'Class Schedules', href: '/owner/classes', icon: <Calendar className="w-4 h-4" />, roles: ['OWNER', 'FRONT_DESK', 'TRAINER_MANAGER', 'FULL'] },
    { label: 'Equipment', href: '/owner/equipment', icon: <Wrench className="w-4 h-4" />, roles: ['OWNER', 'FRONT_DESK', 'TRAINER_MANAGER', 'FULL'] },
    { label: 'Announcements', href: '/owner/announcements', icon: <Megaphone className="w-4 h-4" />, roles: ['OWNER', 'FRONT_DESK', 'MEMBER_MANAGER', 'TRAINER_MANAGER', 'FULL'] },
    { label: 'Trainer Payouts', href: '/owner/payouts', icon: <DollarSign className="w-4 h-4" />, roles: ['OWNER', 'FINANCE', 'FULL'] },
    { label: 'Payment Accounts', href: '/owner/payment-accounts', icon: <Landmark className="w-4 h-4" />, roles: ['OWNER'] },
    { label: 'Revenue Reports', href: '/owner/reports', icon: <BarChart3 className="w-4 h-4" />, roles: ['OWNER', 'FINANCE', 'FULL'] },
    // Referral system temporarily disabled - will be implemented later
    // { label: 'Referral Program', href: '/owner/referral-settings', icon: <Gift className="w-4 h-4" />, roles: ['OWNER'] },
    { label: 'Staff Accounts', href: '/owner/staff', icon: <UserCheck className="w-4 h-4" />, roles: ['OWNER'] },
    { label: 'Platform Billing', href: '/owner/subscription', icon: <CreditCard className="w-4 h-4" />, roles: ['OWNER'] },
    // TODO: Implement Member Support chat in a future release
    // { label: 'Member Support', href: '/owner/chat', icon: <MessageSquare className="w-4 h-4" />, roles: ['OWNER', 'FRONT_DESK', 'MEMBER_MANAGER', 'FULL'] },
  ];

  const filteredNavItems = allNavItems
    .filter((item) => item.roles.includes(effectiveRole))
    .map(({ roles, ...item }) => item);

  return (
    <OwnerShell
      user={session}
      navItems={filteredNavItems}
    >
      {children}
    </OwnerShell>
  );
}

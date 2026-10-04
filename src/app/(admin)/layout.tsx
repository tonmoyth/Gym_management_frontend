'use strict';

import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/getSession';
import { RoleShell } from '@/components/layout/RoleShell';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Users,
  CreditCard,
  AlertTriangle,
  FileWarning,
  UserCheck,
  History,
  Megaphone,
  Gift,
  Layers,
  Landmark,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
  if (!allowedRoles.includes(session.role)) {
    redirect('/unauthorized');
  }

  // If gym business staff with a gym assignment accidentally accesses /admin, redirect to /owner/dashboard
  if (session.role === 'STAFF' && session.staffBusiness) {
    redirect('/owner/dashboard');
  }

  const isSuperAdmin = session.role === 'SUPER_ADMIN';
  const roleTitle = isSuperAdmin
    ? 'Super Admin'
    : session.role === 'ADMIN'
    ? 'Platform Admin'
    : 'Platform Staff';

  const adminNavItems = [
    { label: 'Global Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Gym Approvals', href: '/admin/businesses', icon: <Building2 className="w-4 h-4" />, permission: 'GYM_READ' },
    { label: 'Certifications Audit', href: '/admin/certifications', icon: <ShieldCheck className="w-4 h-4" />, permission: 'CERT_READ' },
    { label: 'User Accounts', href: '/admin/users', icon: <Users className="w-4 h-4" />, permission: 'USER_READ' },
    { label: 'Payment Accounts', href: '/admin/payment-accounts', icon: <Landmark className="w-4 h-4" />, permission: 'PAYMENT_READ' },
    { label: 'Payment Gateways', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" />, permission: 'PAYMENT_READ' },
    { label: 'Dispute Arbitration', href: '/admin/disputes', icon: <AlertTriangle className="w-4 h-4" />, permission: 'DISPUTE_READ' },
    { label: 'Content Moderation', href: '/admin/moderation', icon: <FileWarning className="w-4 h-4" />, permission: 'MODERATION_READ' },
    { label: 'Platform Staff', href: '/admin/staff', icon: <UserCheck className="w-4 h-4" />, permission: 'STAFF_READ' },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: <History className="w-4 h-4" />, permission: 'AUDIT_LOG_READ' },
    { label: 'Announcements', href: '/admin/announcements', icon: <Megaphone className="w-4 h-4" /> },
    // Referral system temporarily disabled - will be implemented later
    // { label: 'B2B Referrals', href: '/admin/referrals', icon: <Gift className="w-4 h-4" /> },
    { label: 'SaaS Subscriptions', href: '/admin/subscriptions', icon: <Layers className="w-4 h-4" />, permission: 'SUBSCRIPTION_READ' },
  ];

  const userPermissions = session.permissions || [];
  const visibleNavItems = adminNavItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });

  return (
    <RoleShell
      user={session}
      roleTitle={roleTitle}
      roleAccent="purple"
      navItems={visibleNavItems}
    >
      {children}
    </RoleShell>
  );
}

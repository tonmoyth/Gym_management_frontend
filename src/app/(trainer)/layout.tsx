'use strict';

import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/getSession';
import { RoleShell } from '@/components/layout/RoleShell';
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Briefcase,
  FileCheck,
  Apple,
  TrendingUp,
  DollarSign,
  Star,
  AlertTriangle,
  MessageSquare,
  Landmark,
} from 'lucide-react';

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'TRAINER') {
    redirect('/unauthorized');
  }

  const trainerNavItems = [
    { label: 'Overview', href: '/trainer/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Profile', href: '/trainer/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Certifications', href: '/trainer/certifications', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Job Openings', href: '/trainer/job-posts', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'My Applications', href: '/trainer/applications', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Member Diet Plans', href: '/trainer/diet-plans', icon: <Apple className="w-4 h-4" /> },
    { label: 'Member Progress', href: '/trainer/progress', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'My Payouts', href: '/trainer/payouts', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Payout Accounts', href: '/trainer/payment-accounts', icon: <Landmark className="w-4 h-4" /> },
    { label: 'Client Reviews', href: '/trainer/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Disputes & Support', href: '/trainer/disputes', icon: <AlertTriangle className="w-4 h-4" /> },
    // { label: 'Direct Messages', href: '/trainer/chat', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <RoleShell
      user={session}
      roleTitle="Trainer Portal"
      roleAccent="teal"
      navItems={trainerNavItems}
    >
      {children}
    </RoleShell>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from './Navbar';
import { Sidebar, NavItem } from './Sidebar';
import { AuthProvider, AuthUser } from '@/lib/auth/AuthContext';
import { businessApi } from '@/lib/api/business.api';
import { subscriptionApi } from '@/lib/api/subscription.api';
import { AlertTriangle, Clock, ArrowRight, CreditCard, Lock } from 'lucide-react';

export interface OwnerShellProps {
  user: AuthUser;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function OwnerShell({
  user,
  navItems,
  children,
}: OwnerShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isStaff = user.role === 'STAFF';
  const isSetupPage = pathname === '/owner/setup';
  const isSubscriptionPage = pathname === '/owner/subscription';

  // Check if staff has access to current pathname
  const isAllowedForStaff =
    !isStaff ||
    pathname === '/owner/dashboard' ||
    navItems.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    );

  // 1. Staff Route Guard: prevent staff from accessing routes not in their permission set
  useEffect(() => {
    if (isStaff && !isAllowedForStaff) {
      router.replace('/owner/dashboard');
    }
  }, [isStaff, isAllowedForStaff, router]);

  // 2. Safeguard: if visiting a dashboard/management page without a business setup, verify and redirect to setup (owners only)
  useEffect(() => {
    if (isSetupPage || isStaff) return;

    if (user.hasBusiness === false) {
      businessApi.getMyBusiness().catch(() => {
        router.replace('/owner/setup');
      });
    }
  }, [isSetupPage, isStaff, user.hasBusiness, router]);

  // 3. Query subscription status to enforce mandatory platform billing
  const {
    data: subStatusRes,
    isLoading: isLoadingSub,
    isFetched: isFetchedSub,
  } = useQuery({
    queryKey: ['owner-subscription-status-guard'],
    queryFn: async () => {
      const res = await subscriptionApi.getStatus();
      return res.data?.data;
    },
    enabled: !isSetupPage && user.hasBusiness !== false,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const subscription = subStatusRes?.subscription;
  const isExpired = subscription?.isExpired || subscription?.status === 'EXPIRED';
  const isPending = subscription?.status === 'PENDING';
  const hasActiveSubscription =
    !!subscription &&
    subscription.status === 'ACTIVE' &&
    !isExpired &&
    subStatusRes?.hasActiveBusiness === true;

  // 4. Strict Redirect Guard: If billing is not active/complete, force redirect to /owner/subscription (owners only)
  useEffect(() => {
    if (isSetupPage || isSubscriptionPage || isStaff) return;

    if (isFetchedSub && !hasActiveSubscription) {
      router.replace('/owner/subscription');
    }
  }, [isSetupPage, isSubscriptionPage, isStaff, isFetchedSub, hasActiveSubscription, router]);

  // If staff tries to access a forbidden page directly, show access restricted screen immediately
  if (isStaff && !isAllowedForStaff) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 font-sans p-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg">
          <Lock className="w-7 h-7" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You do not have permission to access this section with your assigned staff role.
          </p>
          <div className="pt-2">
            <Link
              href="/owner/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If visiting dashboard/features while still checking subscription status, show clean verification screen
  if (!isSetupPage && !isSubscriptionPage && isLoadingSub) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-pulse">
          <CreditCard className="w-6 h-6 animate-bounce" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Checking Platform License...
          </p>
          <p className="text-xs text-slate-400">Verifying subscription status</p>
        </div>
      </div>
    );
  }

  // If visiting dashboard/features and subscription is NOT active, block rendering children immediately
  if (!isSetupPage && !isSubscriptionPage && !hasActiveSubscription) {
    if (isStaff) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 font-sans p-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Gym License Inactive
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The gym platform subscription is currently inactive or awaiting renewal by the gym owner. Please contact your gym administrator or owner.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 font-sans p-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg">
          <Lock className="w-7 h-7" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Platform Subscription Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isPending
              ? 'Your subscription payment is currently under review by Super Admin. You will gain access to the dashboard once verified.'
              : 'You must select a SaaS subscription plan and complete billing before accessing the gym dashboard and management features.'}
          </p>
          <div className="pt-2">
            <Link
              href="/owner/subscription"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
            >
              <span>Go to Platform Billing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine navigation items: if subscription not active, only show "Platform Billing"
  const activeNavItems: NavItem[] = hasActiveSubscription
    ? navItems
    : isStaff
    ? []
    : [
        {
          label: 'Platform Billing',
          href: '/owner/subscription',
          icon: <CreditCard className="w-4 h-4" />,
          badge: isPending ? 'Pending' : 'Required',
        },
      ];

  return (
    <AuthProvider initialUser={user}>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
        <Navbar
          onToggleSidebar={isSetupPage ? undefined : () => setIsSidebarOpen(!isSidebarOpen)}
          roleAccent="blue"
        />

        {/* Global Warning Banner for Expired or Pending Subscription (when on billing page or active) */}
        {!isSetupPage && isExpired && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
                <span>
                  {isStaff
                    ? 'Gym platform license has expired. Please notify the gym owner to renew.'
                    : 'Your gym platform license has expired. Member bookings and attendance turnstile integrations are suspended.'}
                </span>
              </div>
              {!isSubscriptionPage && !isStaff && (
                <Link
                  href="/owner/subscription"
                  className="inline-flex items-center gap-1 bg-white text-rose-700 px-3 py-1 rounded-lg font-bold hover:bg-rose-50 transition-colors shrink-0"
                >
                  <span>Renew License</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {!isSetupPage && !isExpired && isPending && (
          <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
                <span>
                  {isStaff
                    ? 'Gym platform subscription renewal is pending verification by Super Admin.'
                    : 'Your subscription payment is awaiting Super Admin verification. You will be notified once activated.'}
                </span>
              </div>
              {!isSubscriptionPage && !isStaff && (
                <Link
                  href="/owner/subscription"
                  className="inline-flex items-center gap-1 bg-white text-amber-800 px-2.5 py-0.5 rounded-lg font-bold hover:bg-amber-50 transition-colors shrink-0 text-[11px]"
                >
                  <span>Check Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {isSetupPage ? (
          /* Clean, dedicated Setup Layout without sidebar distraction */
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto">
              {children}
            </div>
          </main>
        ) : (
          /* Full Dashboard Layout with Navigation Sidebar */
          <div className="flex-1 flex w-full">
            <Sidebar
              items={activeNavItems}
              roleTitle={isStaff ? 'Staff Portal' : hasActiveSubscription ? 'Owner Dashboard' : 'Setup & Billing'}
              roleAccent="blue"
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
              <div className="w-full max-w-(screen-2xl) mx-auto">
                {children}
              </div>
            </main>
          </div>
        )}
      </div>
    </AuthProvider>
  );
}

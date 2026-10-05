'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/useAuth';
import {
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Award,
  CreditCard,
  QrCode,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Check
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/register';
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'STAFF') {
      return '/admin/dashboard';
    }
    if (user.role === 'BUSINESS_OWNER') {
      return '/owner/dashboard';
    }
    if (user.role === 'TRAINER') {
      return '/trainer/dashboard';
    }
    return '/member/dashboard';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans flex flex-col text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.18),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Next-Gen Fitness Network & Facility SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-balance leading-tight">
            The Modern Ecosystem for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300">
              Athletes, Gyms & Coaches
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal text-balance leading-relaxed">
            Discover verified gyms, book flexible memberships, sync biometric turnstile gates, and train with elite certified personal coaches.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href={getDashboardLink()}>
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-2xl px-8 font-bold shadow-xl shadow-orange-600/25 bg-orange-600 hover:bg-orange-500 gap-2"
                >
                  Go to Your Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-2xl px-8 font-bold shadow-xl shadow-orange-600/25 bg-orange-600 hover:bg-orange-500 gap-2"
                  >
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl px-8 font-bold border-white/20 hover:bg-white/10 text-white"
                  >
                    Member / Owner Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Value Props Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Audited Fitness Centers
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-400" /> Multi-Gateway Payments (bKash / Nagad / Bank)
            </span>
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-orange-400" /> Biometric & Turnstile Gate Sync
            </span>
          </div>
        </div>
      </section>

      {/* Platform Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            Complete Digital Operating System
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Everyone in the Fitness Journey
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Tailored interfaces designed to meet the exact operational demands of members, gym enterprise owners, and certified fitness coaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: For Members */}
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                For Gym Members & Athletes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Browse verified fitness clubs right inside your member portal, subscribe to flexible plans, and track your fitness progression seamlessly.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Discover certified clubs & facilities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>QR Code & Biometric fast facility check-ins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Workout progress logging & personalized diet plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Personal trainer bookings & class schedules</span>
                </li>
              </ul>
            </div>

            <Link href={user?.role === 'MEMBER' ? '/member/gyms' : '/register'} className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 font-bold">
                {user?.role === 'MEMBER' ? 'Explore Gyms in Portal' : 'Join as Member'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Pillar 2: For Gym Owners */}
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                For Gym Owners & Managers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Take command of facility operations with automated ZKTeco turnstile gates, recurring member billing, and full staff management.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>ZKTeco biometric turnstile gate sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Membership package management & renewals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Revenue telemetry & automated coach payroll</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Equipment maintenance & trainer rosters</span>
                </li>
              </ul>
            </div>

            <Link href={user?.role === 'BUSINESS_OWNER' ? '/owner/dashboard' : '/register'} className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 font-bold">
                {user?.role === 'BUSINESS_OWNER' ? 'Go to Owner Dashboard' : 'Register Your Gym'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Pillar 3: For Personal Trainers */}
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                For Certified Trainers & Coaches
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload your certifications for Super Admin audit, apply to partner gyms, manage athlete clients, and receive direct automated payouts.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Audited certification verification badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>1-on-1 member client assignment & rosters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Group fitness class schedule creator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Transparent commission & payout tracking</span>
                </li>
              </ul>
            </div>

            <Link href={user?.role === 'TRAINER' ? '/trainer/dashboard' : '/register'} className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 font-bold">
                {user?.role === 'TRAINER' ? 'Go to Coach Dashboard' : 'Join as Coach'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold">Local BDT Gateways</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accept and verify payments via bKash, Nagad, Rocket, Bank Transfer, and Stripe with instant audit trail.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold">Hardware Turnstile Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct connection to ZKTeco biometrics and RFID turnstiles for automatic gate access authorization.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold">Real-time Telemetry</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track active member capacity, attendance heatmaps, and financial metrics in real time.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold">Audited Governance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Super Admin verification for all registered gyms, disputes arbitration, and trainer certification audits.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center space-y-6">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-orange-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Upgrade Your Fitness Journey?
            </h2>
            <p className="text-sm sm:text-base text-orange-100 leading-relaxed">
              Join thousands of athletes and gym owners leveraging our platform to simplify check-ins, memberships, and workout performance.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-2xl px-8 font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-xl"
                >
                  Create Your Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl px-8 font-bold border-white/40 text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <Dumbbell className="w-4 h-4 text-orange-600" />
            FITNESSPRO SAAS PLATFORM
          </div>
          <p>© {new Date().getFullYear()} FitnessPro. All rights reserved. BDT Currency Supported.</p>
        </div>
      </footer>
    </div>
  );
}

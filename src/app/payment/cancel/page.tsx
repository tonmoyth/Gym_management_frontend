'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  XCircle,
  Dumbbell,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

function PaymentCancelContent() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      {/* Brand Header */}
      <div className="w-full max-w-lg mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
            FITNESS<span className="text-blue-600">PRO</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>No charges incurred</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg space-y-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-orange-500" />

          {/* Cancelled Icon */}
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/15 ring-8 ring-amber-500/10">
              <XCircle className="w-10 h-10" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Payment Cancelled
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            You cancelled the Stripe checkout process. No amount has been deducted from your card or account.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              If you experienced an issue with your payment method or need assistance selecting a different plan, our team is always here to help.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/businesses" className="w-full sm:flex-1">
            <Button
              className="w-full py-3.5 rounded-2xl gap-2 font-bold shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-500"
              size="lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Browse Gym Plans</span>
            </Button>
          </Link>

          <Link href="/member/dashboard" className="w-full sm:flex-1">
            <Button
              variant="outline"
              className="w-full py-3.5 rounded-2xl gap-2 font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}

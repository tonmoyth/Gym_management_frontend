'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { paymentApi, VerifiedSessionData } from '@/lib/api/payment.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Dumbbell,
  ArrowRight,
  Copy,
  Check,
  Building2,
  Calendar,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Printer,
  ChevronRight,
  Loader2,
} from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<VerifiedSessionData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const verify = async () => {
      try {
        const res = await paymentApi.verifySession(sessionId);
        if (isMounted && res.data?.success && res.data.data) {
          setSessionData(res.data.data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Could not retrieve full session details from backend:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleCopyTx = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="absolute -inset-2 bg-emerald-500/10 rounded-full blur-xl -z-10 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Verifying Payment with Stripe...
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
          Please wait while we confirm your transaction and register your membership booking.
        </p>
      </div>
    );
  }

  const displayAmount = sessionData?.amount || 0;
  const displayPlanName = sessionData?.planName || 'Gym Membership Plan';
  const displayGymName = sessionData?.businessName || 'Partner Gym';
  const displayTxId =
    sessionData?.gatewayTransactionId ||
    sessionData?.sessionId ||
    sessionId ||
    'STRIPE_TX_VERIFIED';
  const displayDate = sessionData?.paymentDate
    ? new Date(sessionData.paymentDate).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/15 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-2xl" />
      </div>

      {/* Brand Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
            FITNESS<span className="text-blue-600">PRO</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-full shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>SSL Secured · Stripe Verified</span>
        </div>
      </div>

      {/* Main Success Container */}
      <div className="w-full max-w-2xl space-y-6">
        {/* Celebration Header Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600" />

          {/* Animated Success Badge */}
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-500/15 dark:ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Payment Successful!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Your transaction has been securely processed. Your membership booking request is confirmed and submitted for facility activation.
          </p>

          {/* Amount Paid Pill */}
          <div className="mt-6 inline-flex flex-col items-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 rounded-2xl px-6 py-3 shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Amount Paid
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {displayAmount > 0 ? formatCurrency(displayAmount) : 'Paid Successfully'}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Stripe Card Checkout
            </span>
          </div>
        </div>

        {/* Transaction & Plan Details Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Transaction Receipt
              </h2>
              <p className="text-xs text-slate-400">Order verification and reference information</p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          {/* Key-Value Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block font-medium mb-1">Plan Name</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {displayPlanName}
              </p>
              {sessionData?.planDuration && (
                <span className="text-[11px] text-blue-600 font-semibold">
                  Valid for {sessionData.planDuration} Days
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block font-medium mb-1">Facility / Gym</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{displayGymName}</span>
              </p>
              {sessionData?.businessAddress && (
                <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                  {sessionData.businessAddress}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block font-medium mb-1">Date & Time</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayDate}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block font-medium mb-1">Booking Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {sessionData?.membershipStatus === 'ACTIVE'
                    ? 'Active'
                    : 'Awaiting Owner Approval'}
                </span>
              </div>
            </div>
          </div>

          {/* Reference ID Pill with Copy */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Transaction / Session Reference
              </span>
              <p className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate font-semibold">
                {displayTxId}
              </p>
            </div>
            <button
              onClick={() => handleCopyTx(displayTxId)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm shrink-0"
              title="Copy Reference"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-blue-950/20 dark:to-slate-900/90 backdrop-blur-xl border border-blue-200/60 dark:border-blue-900/40 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            What Happens Next?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">
                1. Payment Confirmed
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Stripe payment verified & receipt registered.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">
                2. Owner Review
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gym owner confirms your booking queue.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">
                3. Facility Access
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your QR check-in code unlocks automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/member/dashboard" className="w-full sm:flex-1">
            <Button
              className="w-full py-3.5 rounded-2xl gap-2 font-bold shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              size="lg"
            >
              <span>Go to Member Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/member/bookings" className="w-full sm:flex-1">
            <Button
              variant="outline"
              className="w-full py-3.5 rounded-2xl gap-2 font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              size="lg"
            >
              <span>View My Bookings</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

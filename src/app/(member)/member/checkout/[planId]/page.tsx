'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { membershipApi } from '@/lib/api/membership.api';
import { paymentApi } from '@/lib/api/payment.api';
import { paymentAccountApi } from '@/lib/api/paymentAccount.api';
import { PaymentGateway, Membership, PaymentAccount, PaymentAccountType } from '@/types/api.types';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building2,
  Copy,
  Check,
  Landmark,
  Smartphone,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function MemberCheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }> | { planId: string };
}) {
  const unwrappedParams = 'then' in params ? use(params) : params;
  const planId = unwrappedParams.planId;
  const router = useRouter();

  // Selected method can be BKASH, NAGAD, or BANK (STRIPE commented out for later use)
  const [selectedMethod, setSelectedMethod] = useState<'BKASH' | 'NAGAD' | 'BANK' /* | 'STRIPE' */>('BKASH');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-payment pending approval tracking
  const [createdMembership, setCreatedMembership] = useState<Membership | null>(null);

  // 1. Fetch plan, gym details, and owner's configured payment receiving accounts
  const {
    data: planRes,
    isLoading: isLoadingPlan,
    error: planFetchError,
  } = useQuery({
    queryKey: ['plan-checkout-details', planId],
    queryFn: async () => {
      const res = await paymentAccountApi.getByPlan(planId);
      return res.data?.data;
    },
    enabled: !!planId,
  });

  const plan = planRes?.plan;
  const business = planRes?.business;
  const paymentAccounts: PaymentAccount[] = planRes?.paymentAccounts || [];

  // Filter accounts matching currently selected method
  const accountsForMethod = paymentAccounts.filter(
    (acc) => acc.accountType === (selectedMethod as PaymentAccountType) && acc.status === 'ACTIVE'
  );

  // Auto-select first or default account for selected method
  useEffect(() => {
    if (accountsForMethod.length > 0) {
      const defaultAcc = accountsForMethod.find((a) => a.isDefault) || accountsForMethod[0];
      setSelectedAccountId(defaultAcc.id);
    } else {
      setSelectedAccountId(null);
    }
  }, [selectedMethod, paymentAccounts]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Poll pending booking if created
  useEffect(() => {
    if (!createdMembership) return;

    const interval = setInterval(async () => {
      try {
        const res = await membershipApi.getById(createdMembership.id);
        if (res.data?.success && res.data.data) {
          setCreatedMembership(res.data.data);
          if (res.data.data.status === 'ACTIVE') {
            clearInterval(interval);
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [createdMembership]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation for manual transfer accounts
    if (accountsForMethod.length === 0) {
      setError(`The gym has not configured an active ${selectedMethod} receiving account. Please choose another payment method.`);
      return;
    }
    if (!transactionId.trim()) {
      setError('Transaction ID (TrxID) is required.');
      return;
    }
    if (!senderPhone.trim()) {
      setError('Sender phone number / account is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create membership booking record
      const memRes = await membershipApi.book({
        businessId: business?.id || 'auto',
        planId,
      });

      const rawData = memRes.data?.data as any;
      const membership = rawData?.membership || rawData;
      const membershipId = membership?.id;

      if (!membership || !membershipId) {
        throw new Error(memRes.data?.message || 'Failed to create booking request');
      }

      // 2. Map gateway for initiate payment
      const gateway: PaymentGateway =
        selectedMethod === 'NAGAD'
          ? 'NAGAD'
          : 'BKASH';
      /*
      // Card / Stripe Gateway mapping (kept for later use)
      const gateway: PaymentGateway =
        selectedMethod === 'STRIPE'
          ? 'STRIPE'
          : selectedMethod === 'NAGAD'
          ? 'NAGAD'
          : 'BKASH';
      */

      const payRes = await paymentApi.initiate({
        membershipId,
        gateway,
        amount: Number(plan?.price || 1500),
        senderPhone: senderPhone.trim() || undefined,
        transactionId: transactionId.trim() || undefined,
      });

      const payData = payRes.data?.data as any;

      /*
      // 3. For Stripe, redirect to Stripe Checkout (kept for later use)
      if (selectedMethod === 'STRIPE') {
        const stripeUrl = payData?.paymentUrl || payData?.gatewayUrl;
        if (stripeUrl) {
          window.location.href = stripeUrl;
          return;
        }
      }
      */

      // 4. Set Pending Approval state in UI
      setCreatedMembership(membership);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to process checkout. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // If booking is placed, render the strict Pending Approval polling state screen
  if (createdMembership) {
    const isApproved = createdMembership.status === 'ACTIVE';

    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          {isApproved ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          ) : (
            <Clock className="w-8 h-8 animate-pulse" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-center">
            <StatusBadge status={createdMembership.status} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isApproved
              ? 'Booking Approved & Active!'
              : 'Payment Submitted — Pending Gym Approval'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {isApproved
              ? 'Your gym owner has confirmed your booking and verified payment! You can now check in using your QR code.'
              : 'Your payment request and transaction details were submitted. Your membership will be activated once the gym owner verifies your payment.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Gym Facility</span>
            <span className="font-bold text-slate-900 dark:text-white">{business?.name || 'Enrolled Gym'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Booking Reference</span>
            <span className="font-mono font-bold">{createdMembership.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Method</span>
            <span className="font-bold">{selectedMethod}</span>
          </div>
          {transactionId && (
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction ID (TrxID)</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{transactionId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {createdMembership.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/member/bookings" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full">
              View All Bookings <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/member/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingPlan) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  // If plan not found
  if (planFetchError || !plan) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-md">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Membership Plan Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested membership plan may have expired or is no longer available.
        </p>
        <div className="pt-2">
          <Link href="/member/gyms">
            <Button variant="primary" size="sm">
              Discover Gyms & Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const paymentMethods: {
    id: 'BKASH' | 'NAGAD' | 'BANK' /* | 'STRIPE' */;
    label: string;
    sublabel: string;
    icon: any;
    color: string;
    activeBorder: string;
    count: number;
  }[] = [
    {
      id: 'BKASH',
      label: 'bKash',
      sublabel: 'Mobile Banking',
      icon: Smartphone,
      color: 'text-pink-600 dark:text-pink-400',
      activeBorder: 'border-pink-500 bg-pink-50/20 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400',
      count: paymentAccounts.filter((a) => a.accountType === 'BKASH' && a.status === 'ACTIVE').length,
    },
    {
      id: 'NAGAD',
      label: 'Nagad',
      sublabel: 'Mobile Banking',
      icon: Smartphone,
      color: 'text-orange-600 dark:text-orange-400',
      activeBorder: 'border-orange-500 bg-orange-50/20 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
      count: paymentAccounts.filter((a) => a.accountType === 'NAGAD' && a.status === 'ACTIVE').length,
    },
    {
      id: 'BANK',
      label: 'Bank Transfer',
      sublabel: 'Wire / Deposit',
      icon: Landmark,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBorder: 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
      count: paymentAccounts.filter((a) => a.accountType === 'BANK' && a.status === 'ACTIVE').length,
    },
    /*
    // Card / Stripe option (commented out for later use)
    {
      id: 'STRIPE',
      label: 'Card / Stripe',
      sublabel: 'Visa, Mastercard',
      icon: CreditCard,
      color: 'text-blue-600 dark:text-blue-400',
      activeBorder: 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
      count: 1,
    },
    */
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Complete Membership Enrollment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your selected plan and send payment directly to the gym's verified accounts.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plan Summary Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {business?.name || 'Gym Facility'}
              </p>
              <p className="text-[11px] text-slate-400">
                {business?.address || 'Official Fitness Partner'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {plan.durationDays || 30} Days Plan
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Selected Package
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {plan.name}
            </p>
            {plan.description && (
              <p className="text-xs text-slate-500 max-w-sm mt-0.5 line-clamp-1">
                {plan.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Payable
            </span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              ৳ {Number(plan.price).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">BDT Currency</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Select Payment Method *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {paymentMethods.map((m) => {
            const isSelected = selectedMethod === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMethod(m.id);
                  setError(null);
                }}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                  isSelected
                    ? `${m.activeBorder} ring-2 ring-blue-500/20 shadow-xs font-bold`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <Icon className={cn('w-4 h-4', isSelected ? '' : m.color)} />
                  {m.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      {m.count} {m.count === 1 ? 'acc' : 'accs'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form and Receiving Account Instructions */}
      <form onSubmit={handleCheckout} className="space-y-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Gym's Verified {selectedMethod} Receiving Accounts</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Send ৳ {Number(plan.price).toLocaleString()} to the gym account below
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Official Receiving Account
              </span>
            </div>

            {/* Display gym owner's actual added accounts */}
            {accountsForMethod.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                <p className="font-bold">No {selectedMethod} Account Added by Gym Owner</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-500">
                  The gym management has not added a {selectedMethod} receiving account yet. Please select an alternative payment method above or contact the gym directly.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {accountsForMethod.map((acc) => {
                  const isChosen = selectedAccountId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={cn(
                        'p-4 rounded-xl border transition-all cursor-pointer space-y-2',
                        isChosen
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {acc.accountName}
                          </span>
                          {acc.isDefault && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                              Primary
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(acc.accountNumber, acc.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {copiedId === acc.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Number</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="font-mono text-base font-black text-slate-900 dark:text-white tracking-wider">
                          {acc.accountNumber}
                        </div>
                        {acc.bankName && (
                          <div className="text-right text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{acc.bankName}</span>
                            {acc.branchName && <span> · {acc.branchName}</span>}
                            {acc.routingNumber && <div className="text-[10px] text-slate-400 font-mono">Routing: {acc.routingNumber}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Payment Input Fields */}
            <div className="pt-2 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                After completing the transfer in your {selectedMethod} mobile app or bank, enter your transaction verification details below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Sender Mobile / Account Number *"
                  placeholder="017XXXXXXXX"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  helperText="The phone or account number you sent payment from."
                />

                <Input
                  label="Transaction ID (TrxID) *"
                  placeholder="e.g. 9J87K1L2M"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  helperText="Official reference provided by bKash/Nagad/Bank."
                />
              </div>
            </div>
          </div>

        {/*
        // Stripe Card Instructions (kept for later use)
        {selectedMethod === 'STRIPE' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <CreditCard className="w-4 h-4 text-blue-600" /> Stripe Secure Card Checkout
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When you submit, you will be redirected to the official Stripe hosted portal to complete payment securely using your Credit or Debit Card (Visa, Mastercard, Amex).
            </p>
          </div>
        )}
        */}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 font-bold"
        >
          {/* selectedMethod === 'STRIPE'
            ? 'Proceed to Stripe Card Checkout'
            : `Confirm Payment of ৳ ${Number(plan.price).toLocaleString()} & Submit` */}
          Confirm Payment of ৳ {Number(plan.price).toLocaleString()} & Submit
        </Button>
      </form>
    </div>
  );
}


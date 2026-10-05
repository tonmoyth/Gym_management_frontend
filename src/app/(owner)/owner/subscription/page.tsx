'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { subscriptionApi, SubmitSubscriptionPaymentDto } from '@/lib/api/subscription.api';
import {
  SubscriptionPlan,
  SubscriptionPayment,
  PaymentAccount,
  PaymentAccountType,
  BillingCycle,
} from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton, TableSkeleton } from '@/components/ui/EmptyState';
import {
  CreditCard,
  Check,
  Clock,
  Calendar,
  CheckCircle2,
  Copy,
  Landmark,
  Smartphone,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function OwnerSubscriptionPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams?.get('onboarding') === 'true';

  // State
  const [billingCycleFilter, setBillingCycleFilter] = useState<BillingCycle>('MONTHLY');
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Checkout form state
  const [selectedMethod, setSelectedMethod] = useState<PaymentAccountType>('BKASH');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // 1. Fetch Subscription Status
  const { data: statusRes, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['owner-subscription-status'],
    queryFn: async () => {
      const res = await subscriptionApi.getStatus();
      return res.data;
    },
  });

  const statusData = statusRes?.data;
  const currentSub = statusData?.subscription;
  const isExpired = currentSub?.isExpired || currentSub?.status === 'EXPIRED';
  const isActive = currentSub?.status === 'ACTIVE' && !isExpired;
  const isPending = currentSub?.status === 'PENDING';

  // 2. Fetch Active Plans
  const { data: plansRes, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['active-subscription-plans'],
    queryFn: async () => {
      const res = await subscriptionApi.getActivePlans();
      return res.data;
    },
  });

  const plans: SubscriptionPlan[] = Array.isArray(plansRes?.data)
    ? plansRes.data
    : (plansRes as any)?.data?.data || [];

  // 3. Fetch Super Admin Payment Accounts
  const { data: accountsRes } = useQuery({
    queryKey: ['super-admin-payment-accounts'],
    queryFn: async () => {
      const res = await subscriptionApi.getPaymentAccounts();
      return res.data;
    },
  });

  const adminAccounts: PaymentAccount[] = Array.isArray(accountsRes?.data)
    ? accountsRes.data
    : (accountsRes as any)?.data?.data || [];

  // Filter accounts matching selected method
  const accountsForMethod = adminAccounts.filter(
    (acc) => acc.accountType === selectedMethod && (!acc.status || acc.status === 'ACTIVE')
  );

  // Auto-select first or default account for selected method
  React.useEffect(() => {
    if (accountsForMethod.length > 0) {
      const defaultAcc = accountsForMethod.find((a) => a.isDefault) || accountsForMethod[0];
      setSelectedAccountId(defaultAcc.id);
    } else {
      setSelectedAccountId('');
    }
  }, [selectedMethod, adminAccounts]);

  // 4. Fetch Payment History
  const { data: paymentsRes, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['owner-subscription-payments'],
    queryFn: async () => {
      const res = await subscriptionApi.getPayments();
      return res.data;
    },
  });

  const paymentHistory: SubscriptionPayment[] = Array.isArray(paymentsRes?.data)
    ? (paymentsRes.data as SubscriptionPayment[])
    : ((paymentsRes as any)?.data?.data || []);

  // 5. Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async (payload: SubmitSubscriptionPaymentDto) => {
      if (isRenewing) {
        return subscriptionApi.renew(payload);
      } else {
        return subscriptionApi.pay(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['owner-subscription-payments'] });
      setCheckoutSuccess(
        isRenewing
          ? 'Renewal payment submitted successfully! Your account will be updated once verified.'
          : 'Subscription payment submitted! Admin will verify your transaction shortly.'
      );
      setTransactionId('');
      setTimeout(() => {
        setIsCheckoutModalOpen(false);
        setCheckoutSuccess(null);
      }, 2500);
    },
    onError: (err: any) => {
      setCheckoutError(
        err.response?.data?.message || 'Failed to submit payment. Please verify transaction ID.'
      );
    },
  });

  const handleOpenCheckout = (plan: SubscriptionPlan, renewing = false) => {
    setSelectedPlanForPayment(plan);
    setIsRenewing(renewing);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setTransactionId('');

    // Preselect available method
    if (adminAccounts.length > 0) {
      setSelectedMethod(adminAccounts[0].accountType);
    }
    setIsCheckoutModalOpen(true);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!selectedPlanForPayment) return;

    if (!selectedAccountId) {
      setCheckoutError('No receiving account found for this method. Please choose another payment method.');
      return;
    }

    if (!transactionId.trim()) {
      setCheckoutError('Transaction ID is required.');
      return;
    }

    paymentMutation.mutate({
      subscriptionPlanId: selectedPlanForPayment.id,
      paymentAccountId: selectedAccountId,
      paymentMethod: selectedMethod,
      transactionId: transactionId.trim(),
    });
  };

  if (isLoadingStatus) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  const filteredPlans = plans.filter((p) => p.billingCycle === billingCycleFilter);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Onboarding Welcome Banner */}
      {isOnboarding && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden animate-in fade-in">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Step 2: SaaS Plan Activation
            </div>
            <h2 className="text-2xl font-black">Welcome to Gym Platform SaaS!</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Your gym profile is registered. Select an operating plan below and submit your initial subscription payment to unlock full member management, bookings, and biometric turnstile sync.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Platform SaaS Subscription
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage your facility software license tier, billing cycles, and payment verifications.
          </p>
        </div>

        {isActive && currentSub && (
          <div className="flex items-center gap-3">
            <Button
              href="/owner/dashboard"
              variant="outline"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="text-xs"
            >
              Go to Dashboard
            </Button>
            {currentSub.canRenew && (
              <Button
                variant="primary"
                onClick={() => {
                  const matchedPlan = plans.find((p) => p.name === currentSub.planName) || plans[0];
                  if (matchedPlan) handleOpenCheckout(matchedPlan, true);
                }}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs"
              >
                Renew License
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Expired Warning Alert */}
      {isExpired && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0 text-rose-500" />
            <div>
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
                Subscription License Expired
              </h4>
              <p className="text-xs text-rose-600/90 dark:text-rose-400/90 mt-0.5">
                Your gym software license has lapsed. Member self-service bookings and turnstile check-ins are currently suspended. Renew now to restore full platform functionality.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              const matchedPlan = plans.find((p) => p.name === currentSub?.planName) || plans[0];
              if (matchedPlan) handleOpenCheckout(matchedPlan, true);
            }}
            className="shrink-0 bg-rose-600 hover:bg-rose-700 text-xs"
          >
            Renew License Now
          </Button>
        </div>
      )}

      {/* Pending Approval Alert */}
      {isPending && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-3 shadow-sm">
          <Clock className="w-6 h-6 shrink-0 text-amber-500 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
              Subscription Verification In Progress
            </h4>
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90 mt-0.5">
              Your subscription payment has been received and is pending Super Admin review. You will be activated automatically once the transaction is verified.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE SUBSCRIPTION OVERVIEW CARD */}
      {isActive && currentSub && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {currentSub.planName}
                </span>
                <StatusBadge status={currentSub.status} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {statusData?.businessName || 'Your Facility'}
              </h2>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ৳ {Number(currentSub.planPrice).toLocaleString()}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                / {currentSub.billingCycle.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-sm">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">License Valid Until</p>
                <p className="text-slate-900 dark:text-white font-bold mt-0.5">
                  {currentSub.endDate
                    ? new Date(currentSub.endDate).toLocaleDateString()
                    : 'Indefinite'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Days Remaining</p>
                <p className="text-slate-900 dark:text-white font-bold mt-0.5">
                  {currentSub.daysRemaining} days remaining
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <CreditCard className="w-5 h-5 text-purple-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Billing Cycle</p>
                <p className="text-slate-900 dark:text-white font-bold mt-0.5 capitalize">
                  {currentSub.billingCycle.toLowerCase()} Pre-paid
                </p>
              </div>
            </div>
          </div>

          {/* Included Features */}
          {currentSub.features && currentSub.features.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Licensed Features:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSub.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PLAN COMPARISON / SELECTION GRID */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isActive ? 'Available SaaS Upgrade Tiers' : 'Select Your Gym SaaS Plan'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select the package that fits your facility scale. Upgrades stack seamlessly onto your active subscription.
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
            <button
              type="button"
              onClick={() => setBillingCycleFilter('MONTHLY')}
              className={cn(
                'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                billingCycleFilter === 'MONTHLY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycleFilter('YEARLY')}
              className={cn(
                'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                billingCycleFilter === 'YEARLY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <span>Annual (Save up to 20%)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>
        </div>

        {isLoadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
            No {billingCycleFilter.toLowerCase()} plans currently listed. Check the alternate billing cycle or contact Super Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const isCurrent = currentSub?.planName === plan.name;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-3xl p-6 border transition-all duration-200 shadow-lg flex flex-col justify-between overflow-hidden',
                    isCurrent
                      ? 'border-blue-500 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  )}
                >
                  <div>
                    {isCurrent && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-bl-xl shadow-xs">
                        Current Plan
                      </div>
                    )}

                    <div className="mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {plan.billingCycle} License
                      </span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {plan.name}
                      </h4>
                      {plan.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ৳ {Number(plan.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        / {plan.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}
                      </span>
                    </div>

                    <div className="mt-6 space-y-2.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Included Features:
                      </p>
                      {plan.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant={isCurrent ? 'outline' : 'primary'}
                      onClick={() => handleOpenCheckout(plan, isCurrent)}
                      className="w-full rounded-xl text-xs"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {isCurrent ? 'Renew Current Plan' : 'Select Plan & Pay'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAYMENT HISTORY */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Subscription Payment Records
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          History of all SaaS subscription transactions submitted by your facility.
        </p>

        {isLoadingPayments ? (
          <TableSkeleton rows={3} />
        ) : paymentHistory.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
            No payment history recorded yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Plan</th>
                    <th className="py-3.5 px-5">Amount</th>
                    <th className="py-3.5 px-5">Method</th>
                    <th className="py-3.5 px-5">Transaction ID</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {paymentHistory.map((p: SubscriptionPayment) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                        {p.planName}
                      </td>
                      <td className="py-3.5 px-5 font-black text-slate-900 dark:text-white">
                        ৳ {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                            p.paymentMethod === 'BANK' && 'bg-blue-500/10 text-blue-500',
                            p.paymentMethod === 'BKASH' && 'bg-[#e2136e]/10 text-[#e2136e]',
                            p.paymentMethod === 'NAGAD' && 'bg-[#f7941d]/10 text-[#f7941d]'
                          )}
                        >
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-800 dark:text-slate-200">
                        {p.transactionId}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={p.status} />
                        {p.status === 'REJECTED' && p.rejectionReason && (
                          <p className="text-[10px] text-rose-500 mt-1 max-w-[150px] truncate" title={p.rejectionReason}>
                            Reason: {p.rejectionReason}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT / RENEWAL MODAL */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title={isRenewing ? 'Renew SaaS Subscription' : 'Complete SaaS Subscription'}
        description={`Submit payment verification for "${selectedPlanForPayment?.name}".`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitCheckout} className="space-y-4">
          {checkoutError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {checkoutSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{checkoutSuccess}</span>
            </div>
          )}

          {/* Commercial Terms Summary Card */}
          {selectedPlanForPayment && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Plan Tier
                </span>
                <p className="text-base font-black text-slate-900 dark:text-white">
                  {selectedPlanForPayment.name}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedPlanForPayment.durationDays || (selectedPlanForPayment.billingCycle === 'YEARLY' ? 365 : 30)} Days Validity
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Payable
                </span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  ৳ {Number(selectedPlanForPayment.price).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">Fixed Rate</span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Payment Method *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'BKASH', label: 'bKash', icon: Smartphone },
                { type: 'NAGAD', label: 'Nagad', icon: Smartphone },
                { type: 'BANK', label: 'Bank Transfer', icon: Landmark },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedMethod(type as PaymentAccountType)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                    selectedMethod === type
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Destination Receiving Account */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                Official Super Admin Receiving Account
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                Verified Target
              </span>
            </div>

            {accountsForMethod.length === 0 ? (
              <p className="text-xs text-rose-500 font-medium">
                No active {selectedMethod} account configured by administration. Please select an alternative payment method.
              </p>
            ) : (
              accountsForMethod.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={cn(
                    'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                    selectedAccountId === acc.id
                      ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xs'
                      : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  )}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {acc.accountName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                        {acc.accountNumber}
                      </span>
                      {acc.bankName && (
                        <span className="text-[11px] text-slate-400">
                          ({acc.bankName}{acc.branchName ? `, ${acc.branchName}` : ''})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(acc.accountNumber, acc.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-blue-600 transition-colors"
                    title="Copy Account Number"
                  >
                    {copiedId === acc.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              👉 Transfer exactly <strong>৳ {selectedPlanForPayment ? Number(selectedPlanForPayment.price).toLocaleString() : ''}</strong> to the account above. After completing the payment, copy the Transaction ID from your receipt and paste it below.
            </p>
          </div>

          {/* Transaction ID */}
          <Input
            label="Transaction ID (TrxID) *"
            placeholder="e.g. 9K201AP87Q or Bank Ref #"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            helperText="Make sure the Transaction ID is exact. Duplicate or incorrect IDs will be rejected."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCheckoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={paymentMutation.isPending}
              disabled={!selectedAccountId || !transactionId.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Payment Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

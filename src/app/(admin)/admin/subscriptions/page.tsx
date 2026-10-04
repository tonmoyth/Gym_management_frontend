'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlanApi, CreateSubscriptionPlanDto } from '@/lib/api/subscriptionPlan.api';
import { subscriptionPaymentApi } from '@/lib/api/subscriptionPayment.api';
import { adminApi } from '@/lib/api/admin.api';
import {
  SubscriptionPlan,
  SubscriptionPayment,
  PlatformSubscription,
  BillingCycle,
  SubscriptionPlanStatus,
  SubscriptionPaymentStatus,
} from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { TableSkeleton, CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import {
  Layers,
  CheckCircle2,
  Building2,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Check,
  X,
  Copy,
  ExternalLink,
  AlertCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Eye,
  CreditCard,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'plans' | 'payments' | 'gyms'>('plans');

  // ==========================================
  // TAB 1: SAAS PLANS STATE & MUTATIONS
  // ==========================================
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [planFormError, setPlanFormError] = useState<string | null>(null);

  // Plan Form state
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planPrice, setPlanPrice] = useState<number | string>(2999);
  const [planBillingCycle, setPlanBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [planDurationDays, setPlanDurationDays] = useState<number>(30);
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [planStatus, setPlanStatus] = useState<SubscriptionPlanStatus>('ACTIVE');

  // Query: Plans
  const { data: plansRes, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const res = await subscriptionPlanApi.getAll();
      return res.data;
    },
  });

  const plans: SubscriptionPlan[] = Array.isArray(plansRes?.data)
    ? plansRes.data
    : (plansRes as any)?.data?.data || [];

  const handleOpenPlanModal = (plan?: SubscriptionPlan) => {
    setPlanFormError(null);
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.name);
      setPlanDesc(plan.description || '');
      setPlanPrice(plan.price);
      setPlanBillingCycle(plan.billingCycle);
      setPlanDurationDays(plan.durationDays || (plan.billingCycle === 'YEARLY' ? 365 : 30));
      setPlanFeatures(plan.features || []);
      setPlanStatus(plan.status);
    } else {
      setEditingPlan(null);
      setPlanName('');
      setPlanDesc('');
      setPlanPrice(3500);
      setPlanBillingCycle('MONTHLY');
      setPlanDurationDays(30);
      setPlanFeatures([
        'Unlimited Gym Members & Member Attendance',
        'ZKTeco Biometric Turnstile Hardware Sync',
        'Multi-Gateway bKash / Nagad / Bank Payments',
        'Trainer Roster & Client Assignments',
      ]);
      setPlanStatus('ACTIVE');
    }
    setIsPlanModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setPlanFeatures([...planFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setPlanFeatures(planFeatures.filter((_, i) => i !== idx));
  };

  // Create / Update Plan Mutation
  const savePlanMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateSubscriptionPlanDto = {
        name: planName.trim(),
        description: planDesc.trim() || undefined,
        price: Number(planPrice),
        billingCycle: planBillingCycle,
        durationDays: Number(planDurationDays),
        features: planFeatures,
        status: planStatus,
      };

      if (editingPlan) {
        return subscriptionPlanApi.update(editingPlan.id, payload);
      } else {
        return subscriptionPlanApi.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      setIsPlanModalOpen(false);
    },
    onError: (err: any) => {
      setPlanFormError(
        err.response?.data?.message || 'Failed to save subscription plan.'
      );
    },
  });

  // Delete Plan Mutation
  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => subscriptionPlanApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      setPlanToDelete(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete plan.');
    },
  });

  // ==========================================
  // TAB 2: PAYMENT VERIFICATION STATE & MUTATIONS
  // ==========================================
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('PENDING');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<SubscriptionPayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

  // Query: Payments
  const { data: paymentsRes, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['admin-subscription-payments', paymentStatusFilter, paymentSearch],
    queryFn: async () => {
      const res = await subscriptionPaymentApi.getAll({
        status: paymentStatusFilter !== 'ALL' ? (paymentStatusFilter as SubscriptionPaymentStatus) : undefined,
        searchTerm: paymentSearch.trim() || undefined,
      });
      return res.data;
    },
  });

  const payments: SubscriptionPayment[] = Array.isArray(paymentsRes?.data)
    ? paymentsRes.data
    : (paymentsRes as any)?.data?.data || [];

  const pendingPaymentsCount = payments.filter((p) => p.status === 'PENDING').length;

  // Approve Payment Mutation
  const approvePaymentMutation = useMutation({
    mutationFn: (id: string) => subscriptionPaymentApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to approve subscription payment.');
    },
  });

  // Reject Payment Mutation
  const rejectPaymentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      subscriptionPaymentApi.reject(id, { rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-payments'] });
      setRejectingPayment(null);
      setRejectionReason('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to reject subscription payment.');
    },
  });

  // ==========================================
  // TAB 3: SUBSCRIBED GYMS OVERVIEW
  // ==========================================
  const [editingSub, setEditingSub] = useState<PlatformSubscription | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const { data: subsRes, isLoading: isLoadingSubs } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => adminApi.getAllSubscriptions(),
  });

  const subscriptions: PlatformSubscription[] = subsRes?.data?.data || [];

  const updateSubStatusMutation = useMutation({
    mutationFn: ({ businessId, status }: { businessId: string; status: string }) =>
      adminApi.updateSubscriptionStatus(businessId, status),
    onSuccess: () => {
      setEditingSub(null);
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
    onError: (err: any) => {
      setOverrideError(err.response?.data?.message || 'Failed to update subscription status.');
    },
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(id);
    setTimeout(() => setCopiedTrxId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            SaaS Subscription Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage commercial subscription packages, verify bank & mobile wallet payments, and audit gym licenses.
          </p>
        </div>

        {activeTab === 'plans' && (
          <Button
            variant="primary"
            onClick={() => handleOpenPlanModal()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            Create New SaaS Plan
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'plans', label: 'SaaS Plan Tiers', icon: <Layers className="w-4 h-4" /> },
          {
            id: 'payments',
            label: 'Payment Verifications',
            count: pendingPaymentsCount,
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          { id: 'gyms', label: 'Subscribed Facilities', icon: <Building2 className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* TAB 1: SAAS PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {isLoadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : plans.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No Subscription Plans Created"
              description="Define your first SaaS subscription tier (e.g. Starter, Growth, Enterprise) with custom pricing and features."
              actionLabel="Create Plan"
              onAction={() => handleOpenPlanModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isMonthly = plan.billingCycle === 'MONTHLY';

                return (
                  <div
                    key={plan.id}
                    className="relative rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {plan.billingCycle}
                        </span>
                        <StatusBadge status={plan.status} />
                      </div>

                      {/* Plan Title & Description */}
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {plan.description}
                        </p>
                      )}

                      {/* Price Display */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                          ৳ {Number(plan.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          / {isMonthly ? 'month' : 'year'} ({plan.durationDays || (isMonthly ? 30 : 365)} days)
                        </span>
                      </div>

                      {/* Features List */}
                      <div className="mt-5 space-y-2.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Package Highlights:
                        </p>
                        {plan.features?.length > 0 ? (
                          plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No features listed.</p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenPlanModal(plan)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Edit Plan
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPlanToDelete(plan)}
                        className="text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT VERIFICATION */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Trx ID or gym name..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPaymentStatusFilter(st)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                    paymentStatusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  {st === 'ALL' ? 'All Records' : st}
                </button>
              ))}
            </div>
          </div>

          {isLoadingPayments ? (
            <TableSkeleton rows={5} />
          ) : payments.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Payment Records Found"
              description="Gym subscription payments submitted via bKash, Nagad, or Bank will appear here for verification."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Gym Facility</th>
                      <th className="py-3.5 px-5">Plan</th>
                      <th className="py-3.5 px-5">Amount & Method</th>
                      <th className="py-3.5 px-5">Transaction ID</th>
                      <th className="py-3.5 px-5">Proof</th>
                      <th className="py-3.5 px-5">Submitted At</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {payments.map((p) => {
                      const gymName = (p as any).business?.name || `Gym (${p.businessId?.slice(0, 8)})`;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {gymName}
                            </div>
                            <span className="text-[11px] text-slate-400">ID: {p.businessId?.slice(0, 8)}</span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {p.planName}
                            </span>
                            <div className="text-[10px] text-slate-400 uppercase">{p.billingCycle}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-black text-slate-900 dark:text-white">
                              ৳ {Number(p.amount).toLocaleString()}
                            </div>
                            <span
                              className={cn(
                                'inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 uppercase tracking-wider',
                                p.paymentMethod === 'BANK' && 'bg-blue-500/10 text-blue-500',
                                p.paymentMethod === 'BKASH' && 'bg-[#e2136e]/10 text-[#e2136e]',
                                p.paymentMethod === 'NAGAD' && 'bg-[#f7941d]/10 text-[#f7941d]'
                              )}
                            >
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg w-fit">
                              <span>{p.transactionId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(p.transactionId, p.id)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                                title="Copy Trx ID"
                              >
                                {copiedTrxId === p.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            {p.paymentProof ? (
                              <button
                                type="button"
                                onClick={() => setProofModalUrl(p.paymentProof!)}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Proof
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-xs text-slate-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-5">
                            <StatusBadge status={p.status} />
                            {p.status === 'REJECTED' && p.rejectionReason && (
                              <p className="text-[10px] text-rose-400 mt-1 max-w-[150px] truncate" title={p.rejectionReason}>
                                Reason: {p.rejectionReason}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {p.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => approvePaymentMutation.mutate(p.id)}
                                  isLoading={approvePaymentMutation.isPending}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRejectingPayment(p);
                                    setRejectionReason('');
                                  }}
                                  className="text-xs text-rose-500 hover:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-normal">
                                Reviewed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBSCRIBED GYMS */}
      {activeTab === 'gyms' && (
        <div className="space-y-6">
          {isLoadingSubs ? (
            <TableSkeleton rows={4} />
          ) : subscriptions.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Active Subscriptions"
              description="Active gym facility licenses will be listed here with renewal schedules."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-4 px-6">Gym Facility</th>
                      <th className="py-4 px-6">License Plan</th>
                      <th className="py-4 px-6">License Expiry / Renewal</th>
                      <th className="py-4 px-6">Billing Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {subscriptions.map((sub) => {
                      const gymName = (sub as any).business?.name || `Gym (${sub.businessId?.slice(0, 8)})`;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              <span>{gymName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                              {sub.plan || 'STANDARD'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {sub.currentPeriodEnd
                                  ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                                  : 'Ongoing'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={sub.status} />
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSub(sub);
                                setSelectedStatus(sub.status || 'ACTIVE');
                                setOverrideError(null);
                              }}
                              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                              className="text-xs"
                            >
                              Override Status
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT PLAN */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? 'Edit SaaS Subscription Plan' : 'Create New SaaS Subscription Plan'}
        description="Configure tier parameters, recurring prices, and feature checklists."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            savePlanMutation.mutate();
          }}
          className="space-y-4"
        >
          {planFormError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{planFormError}</span>
            </div>
          )}

          <Input
            label="Plan Name *"
            placeholder="e.g. Standard Gym License, Enterprise Pro"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            required
          />

          <Textarea
            label="Plan Description"
            placeholder="Brief overview of who this tier is designed for..."
            value={planDesc}
            onChange={(e) => setPlanDesc(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Price (BDT) *"
              type="number"
              min={0}
              placeholder="3500"
              value={planPrice}
              onChange={(e) => setPlanPrice(e.target.value)}
              required
            />
            <Select
              label="Billing Cycle *"
              value={planBillingCycle}
              onChange={(e) => {
                const cycle = e.target.value as BillingCycle;
                setPlanBillingCycle(cycle);
                setPlanDurationDays(cycle === 'YEARLY' ? 365 : 30);
              }}
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'YEARLY', label: 'Yearly' },
              ]}
            />
            <Input
              label="Duration (Days) *"
              type="number"
              min={1}
              value={planDurationDays}
              onChange={(e) => setPlanDurationDays(Number(e.target.value))}
              required
            />
          </div>

          {/* Dynamic Features List */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Feature Bullet Points
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. ZKTeco Turnstile Hardware Integration"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddFeature}
                className="shrink-0 text-xs"
              >
                Add Feature
              </Button>
            </div>

            {/* List of features */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {planFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Select
              label="Status *"
              value={planStatus}
              onChange={(e) => setPlanStatus(e.target.value as SubscriptionPlanStatus)}
              options={[
                { value: 'ACTIVE', label: 'Active (Available to gym owners)' },
                { value: 'INACTIVE', label: 'Inactive (Hidden from checkout)' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={savePlanMutation.isPending}
            >
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE PLAN DIALOG */}
      <ConfirmDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={() => {
          if (planToDelete) {
            deletePlanMutation.mutate(planToDelete.id);
          }
        }}
        title="Delete SaaS Subscription Plan"
        description={`Are you sure you want to delete the plan "${planToDelete?.name}"? If any gyms are actively subscribed, the system will prevent deletion to preserve active billing.`}
        confirmText="Delete Plan"
        variant="danger"
        isLoading={deletePlanMutation.isPending}
      />

      {/* REJECT PAYMENT MODAL */}
      <Modal
        isOpen={!!rejectingPayment}
        onClose={() => {
          setRejectingPayment(null);
          setRejectionReason('');
        }}
        title="Reject Subscription Payment"
        description="Provide a clear explanation so the gym owner knows why their transaction could not be verified."
      >
        <div className="space-y-4">
          <Textarea
            label="Rejection Reason *"
            placeholder="e.g. Transaction ID not found in bKash statement, or amount sent was insufficient."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectingPayment(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!rejectionReason.trim()}
              isLoading={rejectPaymentMutation.isPending}
              onClick={() => {
                if (rejectingPayment && rejectionReason.trim()) {
                  rejectPaymentMutation.mutate({
                    id: rejectingPayment.id,
                    reason: rejectionReason.trim(),
                  });
                }
              }}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* VIEW PAYMENT PROOF MODAL */}
      <Modal
        isOpen={!!proofModalUrl}
        onClose={() => setProofModalUrl(null)}
        title="Payment Proof Attachment"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {proofModalUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2 min-h-[300px]">
              {/* If it is an image url */}
              <img
                src={proofModalUrl}
                alt="Payment Proof"
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as any).style.display = 'none';
                  (e.target as any).nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }} className="p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Could not render image preview.</p>
                <a
                  href={proofModalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 font-semibold inline-flex items-center gap-1.5 hover:underline text-xs"
                >
                  <ExternalLink className="w-4 h-4" /> Open Proof URL Directly
                </a>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setProofModalUrl(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* OVERRIDE STATUS MODAL */}
      <Modal
        isOpen={!!editingSub}
        onClose={() => setEditingSub(null)}
        title="Override Gym License Status"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingSub) {
              setOverrideError(null);
              updateSubStatusMutation.mutate({
                businessId: editingSub.businessId || (editingSub as any).id,
                status: selectedStatus,
              });
            }
          }}
          className="space-y-4"
        >
          {overrideError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{overrideError}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Select a new billing state for this facility. Setting to PAST_DUE or CANCELLED restricts booking and onboarding.
          </p>

          <Select
            label="License Status *"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'ACTIVE', label: 'Active (Full Platform Access)' },
              { value: 'PAST_DUE', label: 'Past Due (Payment Overdue Warning)' },
              { value: 'CANCELLED', label: 'Cancelled (Access Suspended)' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingSub(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateSubStatusMutation.isPending}
            >
              Update Status
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

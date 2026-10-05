'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle,
  Clock,
  CreditCard,
  Copy,
  Check,
  Eye,
  User
} from 'lucide-react';
import { Business } from '@/types/api.types';

export default function AdminBusinessesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [rejectingGym, setRejectingGym] = useState<Business | null>(null);
  const [suspendingGymId, setSuspendingGymId] = useState<string | null>(null);
  const [approvingGymId, setApprovingGymId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);

  // 1. Fetch pending businesses
  const { data: pendingRes, isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin-pending-businesses'],
    queryFn: () => adminApi.getPendingBusinesses(),
    enabled: activeTab === 'pending',
  });

  const pendingGyms: Business[] = pendingRes?.data?.data || [];

  // 2. Fetch all businesses
  const { data: allRes, isLoading: isAllLoading } = useQuery({
    queryKey: ['admin-all-businesses'],
    queryFn: () => adminApi.getAllBusinesses(),
    enabled: activeTab === 'all',
  });

  const allGyms: Business[] = allRes?.data?.data || [];

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper for Payment Method Badges
  const renderPaymentMethodBadge = (method?: string) => {
    if (!method) return null;
    const upper = method.toUpperCase();
    let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
    if (upper.includes('BKASH')) {
      badgeStyle = 'bg-[#e2136e]/15 text-[#e2136e] border-[#e2136e]/30';
    } else if (upper.includes('NAGAD')) {
      badgeStyle = 'bg-[#f7941d]/15 text-[#f7941d] border-[#f7941d]/30';
    } else if (upper.includes('ROCKET')) {
      badgeStyle = 'bg-[#8c3494]/15 text-[#8c3494] border-[#8c3494]/30';
    } else if (upper.includes('BANK')) {
      badgeStyle = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    } else if (upper.includes('UPAY')) {
      badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${badgeStyle}`}>
        {method}
      </span>
    );
  };

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveBusiness(id),
    onMutate: (id: string) => {
      setApprovingGymId(id);
      setErrorMessage(null);
    },
    onSuccess: () => {
      setApprovingGymId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-payments'] });
    },
    onError: (err: any) => {
      setApprovingGymId(null);
      setErrorMessage(err.response?.data?.message || 'Failed to approve gym.');
    }
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.rejectBusiness(id, reason),
    onSuccess: () => {
      setRejectingGym(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-payments'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to reject gym.');
    }
  });

  // Suspend Mutation
  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendBusiness(id),
    onSuccess: () => {
      setSuspendingGymId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-all-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingGym) return;
    rejectMutation.mutate({ id: rejectingGym.id, reason: rejectionReason });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gym Verification & Management</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Verify payment transaction IDs, validate facility credentials, and activate newly registered gyms.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-5 text-sm font-bold transition-all relative ${
            activeTab === 'pending'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({pendingGyms.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-5 text-sm font-bold transition-all relative ${
            activeTab === 'all'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>All Registered Gyms ({allGyms.length})</span>
          </div>
        </button>
      </div>

      {/* Pending Gyms Tab */}
      {activeTab === 'pending' && (
        <div>
          {isPendingLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : pendingGyms.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All Gym Applications Reviewed"
              description="No pending gym registrations waiting for payment verification in the queue."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingGyms.map((gym: Business) => {
                const latestPayment = gym.subscriptionPayments?.[0];

                return (
                  <div
                    key={gym.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between space-y-5"
                  >
                    <div>
                      {/* Gym Facility Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          {gym.logo ? (
                            <img
                              src={gym.logo}
                              alt={gym.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg">
                              {gym.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">{gym.name}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              {gym.address || 'Address pending'}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={gym.status} />
                      </div>

                      {/* Owner & Submission Info */}
                      <div className="space-y-1.5 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-400">
                        {gym.owner && (
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-slate-300 font-semibold">{gym.owner.fullName || 'Business Owner'}</span>
                            {gym.owner.email && <span className="text-slate-500">({gym.owner.email})</span>}
                          </div>
                        )}
                        {gym.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{gym.phone}</span>
                          </div>
                        )}
                        {gym.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{gym.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Submitted on {new Date(gym.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {gym.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                          {gym.description}
                        </p>
                      )}

                      {/* PAYMENT & TRANSACTION VERIFICATION SECTION */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 shadow-inner space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                              <CreditCard className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-white tracking-wide uppercase">
                              Payment & Transaction Verification
                            </span>
                          </div>
                          {latestPayment ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              latestPayment.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : latestPayment.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                            }`}>
                              {latestPayment.status === 'PENDING' ? 'Pending Verification' : latestPayment.status}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              No Payment Submitted
                            </span>
                          )}
                        </div>

                        {latestPayment ? (
                          <div className="space-y-3">
                            {/* Transaction ID Prominent Highlight */}
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="space-y-0.5 overflow-hidden pr-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Transaction ID (TRX)
                                </span>
                                <span className="font-mono text-sm font-black text-purple-300 tracking-wider truncate block">
                                  {latestPayment.transactionId}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(latestPayment.transactionId, `trx-${gym.id}`)}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
                                title="Copy Transaction ID"
                              >
                                {copiedId === `trx-${gym.id}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 text-[11px]">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-[11px]">Copy ID</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Payment Details 2x2 Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                                <span className="text-[10px] text-slate-400 block font-medium">Paid Amount</span>
                                <span className="font-bold text-emerald-400 text-sm">
                                  {formatCurrency(latestPayment.amount)}
                                </span>
                              </div>
                              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                                <span className="text-[10px] text-slate-400 block font-medium">Payment Method</span>
                                <div className="mt-0.5">
                                  {renderPaymentMethodBadge(latestPayment.paymentMethod)}
                                </div>
                              </div>
                              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                                <span className="text-[10px] text-slate-400 block font-medium">Plan Requested</span>
                                <span className="font-semibold text-slate-200">
                                  {latestPayment.planName} ({latestPayment.billingCycle})
                                </span>
                              </div>
                              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                                <span className="text-[10px] text-slate-400 block font-medium">Receiving Account</span>
                                <span className="font-mono text-slate-300 text-[11px] block truncate" title={latestPayment.paymentAccount?.accountNumber}>
                                  {latestPayment.paymentAccount ? (
                                    `${latestPayment.paymentAccount.accountNumber} (${latestPayment.paymentAccount.bankName || latestPayment.paymentAccount.accountType})`
                                  ) : (
                                    'Default Platform Account'
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Proof Screenshot if attached */}
                            {latestPayment.paymentProof && (
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs text-slate-400">Payment receipt attached:</span>
                                <button
                                  type="button"
                                  onClick={() => setProofModalUrl(latestPayment.paymentProof!)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Receipt Proof</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>No payment transaction submitted yet by this gym owner.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => approveMutation.mutate(gym.id)}
                        isLoading={approveMutation.isPending && approvingGymId === gym.id}
                        disabled={approveMutation.isPending}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        className="flex-1 text-xs"
                      >
                        Approve Gym
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectingGym(gym);
                          setRejectionReason('');
                        }}
                        disabled={approveMutation.isPending && approvingGymId === gym.id}
                        leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        className="flex-1 text-xs text-rose-400 hover:bg-rose-500/10"
                      >
                        Reject Application
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All Gyms Tab */}
      {activeTab === 'all' && (
        <div>
          {isAllLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : allGyms.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Registered Gyms"
              description="Registered fitness centers will appear in this registry."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allGyms.map((gym: Business) => {
                const isSuspended = gym.status === 'SUSPENDED';

                return (
                  <div
                    key={gym.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{gym.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{gym.address}</p>
                        </div>
                        <StatusBadge status={gym.status} />
                      </div>

                      <div className="space-y-1.5 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-400">
                        {gym.owner ? (
                          <p>
                            Owner: <span className="text-slate-300 font-semibold">{gym.owner.fullName || 'Business Owner'}</span>
                            {gym.owner.email && <span className="text-slate-500"> ({gym.owner.email})</span>}
                          </p>
                        ) : (
                          <p>Owner ID: <span className="font-mono text-slate-300">{gym.ownerId?.slice(0, 8)}...</span></p>
                        )}
                        {gym.businessSubscription && (
                          <p>
                            Plan: <span className="text-purple-300 font-semibold">{gym.businessSubscription.planName || 'Platform Plan'}</span> ({gym.businessSubscription.status})
                          </p>
                        )}
                        <p>Joined: {new Date(gym.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-end">
                      <Button
                        size="sm"
                        variant={isSuspended ? 'outline' : 'ghost'}
                        onClick={() => setSuspendingGymId(gym.id)}
                        leftIcon={<Ban className="w-3.5 h-3.5 text-rose-400" />}
                        className="text-xs text-rose-400 hover:bg-rose-500/10"
                      >
                        {isSuspended ? 'Reactivate Gym' : 'Suspend Access'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingGym}
        onClose={() => setRejectingGym(null)}
        title="Reject Gym Application"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-sm text-slate-300">
            Specify the compliance reason for rejecting <strong>{rejectingGym?.name}</strong>. An email notification will be dispatched to the owner.
          </p>

          <Textarea
            label="Rejection Reason *"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Invalid transaction ID provided or payment could not be verified in receiving account."
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingGym(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={rejectMutation.isPending}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Proof Modal */}
      {proofModalUrl && (
        <Modal
          isOpen={!!proofModalUrl}
          onClose={() => setProofModalUrl(null)}
          title="Payment Receipt Proof"
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={proofModalUrl}
                alt="Payment Proof Receipt"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setProofModalUrl(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend Confirmation */}
      <ConfirmDialog
        isOpen={!!suspendingGymId}
        onClose={() => setSuspendingGymId(null)}
        onConfirm={() => suspendingGymId && suspendMutation.mutate(suspendingGymId)}
        title="Toggle Gym Suspension Status?"
        description="Suspending a gym prevents new member bookings and disables public discovery visibility."
        confirmLabel="Confirm Action"
        variant="danger"
        isLoading={suspendMutation.isPending}
      />
    </div>
  );
}

'use strict';
'use client';

import React, { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  DollarSign,
  AlertCircle,
  ShieldAlert,
  CreditCard,
  Ban,
  Building2,
  Dumbbell
} from 'lucide-react';
import Link from 'next/link';

type ResolutionType = 'REFUND' | 'WARNING' | 'ACCOUNT_ACTION' | 'DISMISSAL';

export default function AdminDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: disputeId } = use(params);
  const queryClient = useQueryClient();

  const [resolutionType, setResolutionType] = useState<ResolutionType>('REFUND');
  const [resolutionNote, setResolutionNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [accountAction, setAccountAction] = useState<'SUSPEND' | 'ACTIVATE'>('SUSPEND');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch dispute detail
  const { data: disputeRes, isLoading } = useQuery({
    queryKey: ['admin-dispute-detail', disputeId],
    queryFn: () => adminApi.getDisputeById(disputeId),
  });

  const dispute = disputeRes?.data?.data as any;

  // Resolve Mutation
  const resolveMutation = useMutation({
    mutationFn: (type?: ResolutionType) => {
      const selectedType = type || resolutionType;
      const note = resolutionNote.trim();

      return adminApi.resolveDispute(disputeId, {
        resolution: selectedType,
        reason: note,
        resolutionNote: note,
        status: selectedType === 'DISMISSAL' ? 'DISMISSED' : 'RESOLVED',
        paymentId: dispute?.relatedPayment?.id,
        accountAction: selectedType === 'ACCOUNT_ACTION' ? accountAction : undefined,
        targetUserId: selectedType === 'ACCOUNT_ACTION' ? (dispute?.user?.id || dispute?.member?.id) : undefined,
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
      });
    },
    onSuccess: () => {
      setSuccessMessage('Dispute ruling submitted successfully!');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-detail', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to record dispute ruling.');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Dispute Not Found</h3>
        <p className="text-slate-400 mb-4">This dispute record does not exist or has been archived.</p>
        <Link href="/admin/disputes">
          <Button variant="outline">Return to Queue</Button>
        </Link>
      </div>
    );
  }

  const isClosed = dispute.status === 'RESOLVED' || dispute.status === 'DISMISSED';
  const complainant = dispute.user || dispute.member;
  const payment = dispute.relatedPayment;

  const resolutionOptions: {
    type: ResolutionType;
    title: string;
    description: string;
    icon: any;
    color: string;
  }[] = [
    {
      type: 'REFUND',
      title: 'Issue Refund',
      description: 'Refund transaction to complainant via original payment gateway.',
      icon: CreditCard,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    },
    {
      type: 'WARNING',
      title: 'Issue Warning',
      description: 'Issue official platform warning to the respondent.',
      icon: AlertTriangle,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    },
    {
      type: 'ACCOUNT_ACTION',
      title: 'Account Action',
      description: 'Suspend or restrict an account involved in this dispute.',
      icon: Ban,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    },
    {
      type: 'DISMISSAL',
      title: 'Dismiss Claim',
      description: 'Dismiss the dispute as unfounded, invalid, or resolved.',
      icon: XCircle,
      color: 'border-slate-600 bg-slate-800/40 text-slate-300',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-4 border-b border-slate-800 pb-6">
        <Link
          href="/admin/disputes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Disputes Queue
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-purple-300">
                {dispute.category}
              </span>
              <StatusBadge status={dispute.status} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {dispute.subject || 'Platform Escalation'}
            </h1>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Case Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Complainant Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <User className="w-4 h-4 text-purple-400" />
            <span>Complainant</span>
          </div>
          <div className="text-base font-bold text-white">
            {complainant?.fullName || 'Platform User'}
          </div>
          <div className="text-xs text-slate-400">
            Email: <span className="text-slate-300">{complainant?.email || 'N/A'}</span>
          </div>
          <div className="text-xs text-slate-400">
            Role: <span className="text-slate-300 font-semibold">{complainant?.role || 'MEMBER'}</span>
          </div>
        </div>

        {/* Counterparty / Associated entity */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Involved Entity</span>
          </div>
          {dispute.business ? (
            <div>
              <div className="text-base font-bold text-white">{dispute.business.name}</div>
              <div className="text-xs text-slate-400">Status: {dispute.business.status}</div>
            </div>
          ) : dispute.trainer ? (
            <div>
              <div className="text-base font-bold text-white">
                {dispute.trainer.user?.fullName || 'Trainer Profile'}
              </div>
              <div className="text-xs text-slate-400">
                Email: {dispute.trainer.user?.email || 'N/A'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic">Platform Level / Unspecified</div>
          )}
        </div>
      </div>

      {/* Linked Payment Details (if any) */}
      {payment && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Associated Transaction</span>
            </div>
            <StatusBadge status={payment.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-500">Amount</div>
              <div className="text-sm font-bold text-white">৳ {payment.amount} {payment.currency}</div>
            </div>
            <div>
              <div className="text-slate-500">Gateway</div>
              <div className="text-sm font-semibold text-slate-300">{payment.gateway}</div>
            </div>
            <div>
              <div className="text-slate-500">Transaction ID</div>
              <div className="text-xs font-mono text-slate-300 truncate">{payment.gatewayTransactionId || payment.id}</div>
            </div>
            <div>
              <div className="text-slate-500">Date</div>
              <div className="text-slate-300">{new Date(payment.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Narrative */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-white">Complainant Narrative</h2>
        <div className="text-xs text-slate-500">
          Filed on: {new Date(dispute.createdAt).toLocaleString()}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {dispute.description}
        </p>
      </div>

      {/* Arbitration Form if open */}
      {!isClosed ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Super Admin Ruling & Order</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an official arbitration ruling and record the platform policy order.
            </p>
          </div>

          {/* 4 Resolution Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resolutionOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = resolutionType === opt.type;

              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setResolutionType(opt.type)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${opt.color} ring-2 ring-purple-500/30 shadow-lg`
                      : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-sm text-white">{opt.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Conditional Input based on type */}
          {resolutionType === 'REFUND' && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>Gateway Refund Directive</span>
              </div>
              <Input
                label="Refund Amount (BDT ৳ - Optional)"
                type="number"
                min="0"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={payment ? `Full: ${payment.amount}` : 'e.g. 1500'}
                helperText="System will initiate gateway refund to the payer's original payment method."
              />
            </div>
          )}

          {resolutionType === 'ACCOUNT_ACTION' && (
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>Enforce Account Status Change</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="accountAction"
                    value="SUSPEND"
                    checked={accountAction === 'SUSPEND'}
                    onChange={() => setAccountAction('SUSPEND')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Suspend Account</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="accountAction"
                    value="ACTIVATE"
                    checked={accountAction === 'ACTIVATE'}
                    onChange={() => setAccountAction('ACTIVATE')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Re-activate Account</span>
                </label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Textarea
              label="Official Arbitration Resolution Note *"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Explain the findings, platform policy rulings, and directives given to both parties..."
              rows={4}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={() => {
                setResolutionType('DISMISSAL');
                resolveMutation.mutate('DISMISSAL');
              }}
              isLoading={resolveMutation.isPending && resolutionType === 'DISMISSAL'}
              leftIcon={<XCircle className="w-4 h-4 text-slate-400" />}
              className="text-xs"
            >
              Quick Dismiss
            </Button>
            <Button
              variant="primary"
              onClick={() => resolveMutation.mutate(resolutionType)}
              isLoading={resolveMutation.isPending && resolutionType !== 'DISMISSAL'}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="text-xs bg-emerald-600 hover:bg-emerald-500"
              disabled={!resolutionNote.trim()}
            >
              Apply Ruling & Close Dispute
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">Official Ruling Summary</h2>
            <StatusBadge status={dispute.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div>
              <span className="text-slate-500 block">Ruling Action:</span>
              <strong className="text-purple-300 font-semibold">{dispute.resolution || dispute.status}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Resolved At:</span>
              <strong className="text-white">
                {dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleString() : 'N/A'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Case Outcome:</span>
              <strong className="text-emerald-400 font-semibold">{dispute.status}</strong>
            </div>
          </div>

          {(dispute.resolutionReason || dispute.adminReply || dispute.resolutionNote) && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Arbitrator Directive:</span>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {dispute.resolutionReason || dispute.adminReply || dispute.resolutionNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

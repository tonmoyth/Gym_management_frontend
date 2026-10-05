'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { payoutApi, CreatePayoutInput } from '@/lib/api/payout.api';
import { trainerApi } from '@/lib/api/trainer.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  Award, 
  AlertCircle,
  Copy,
  Check,
  Landmark,
  Smartphone,
  Filter,
  RotateCcw
} from 'lucide-react';
import { TrainerPayout } from '@/types/api.types';

export default function OwnerPayoutsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [markingPayoutId, setMarkingPayoutId] = useState<string | null>(null);
  const [txRef, setTxRef] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Form State
  const [trainerId, setTrainerId] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // Filter States
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTrainerId, setFilterTrainerId] = useState('ALL');

  const handleClearFilters = () => {
    setFilterMonth('');
    setFilterStatus('ALL');
    setFilterTrainerId('ALL');
  };

  const hasActiveFilters = !!filterMonth || filterStatus !== 'ALL' || filterTrainerId !== 'ALL';

  // 2. Fetch gym payouts with active filters
  const { data: payoutsRes, isLoading: isPayoutsLoading } = useQuery({
    queryKey: ['business-payouts', businessId, filterMonth, filterStatus, filterTrainerId],
    queryFn: () =>
      payoutApi.listByBusiness(businessId!, {
        month: filterMonth || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        trainerId: filterTrainerId !== 'ALL' ? filterTrainerId : undefined,
      }),
    enabled: !!businessId,
  });

  const rawData = payoutsRes?.data?.data;
  const payouts: TrainerPayout[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.data)
    ? (rawData as any).data
    : [];

  const summary = (!Array.isArray(rawData) && (rawData as any)?.summary) || null;

  // 3. Fetch gym trainers
  const { data: trainersRes } = useQuery({
    queryKey: ['business-trainers', businessId],
    queryFn: () => trainerApi.getBusinessTrainers(businessId!),
    enabled: !!businessId,
  });

  const trainers = trainersRes?.data?.data || [];

  // Create Payout Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePayoutInput) => payoutApi.createOrUpdate(businessId!, data),
    onSuccess: () => {
      setIsCreateOpen(false);
      setTrainerId('');
      setAmount('');
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['business-payouts', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to record payout.');
    }
  });

  // Mark Paid Mutation
  const markPaidMutation = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref: string }) =>
      payoutApi.markAsPaid(businessId!, id, { transactionReference: ref }),
    onSuccess: () => {
      setMarkingPayoutId(null);
      setTxRef('');
      queryClient.invalidateQueries({ queryKey: ['business-payouts', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to mark as paid.');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const [yearPart, monthPart] = month.split('-');
    const yearNum = parseInt(yearPart, 10);
    const monthNum = parseInt(monthPart, 10);
    createMutation.mutate({
      trainerId,
      month: monthNum,
      year: yearNum,
      amount: parseFloat(amount),
      note: note || undefined,
    });
  };

  const handleConfirmMarkPaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markingPayoutId) return;
    markPaidMutation.mutate({ id: markingPayoutId, ref: txRef });
  };

  if (isBusinessLoading || isPayoutsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Trainer Monthly Payouts</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage fixed monthly remuneration and track disbursement status to your personal trainers.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setIsCreateOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Payout
        </Button>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Obligation</span>
            <p className="text-2xl font-black text-white mt-1">{formatCurrency(summary.totalPayout || 0)}</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Disbursed</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(summary.totalPaid || 0)}</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pending Amount</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{formatCurrency(summary.totalPending || 0)}</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Trainers on Roster</span>
            <p className="text-2xl font-black text-white mt-1">{summary.totalTrainers || 0}</p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> Filter Payout Records
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Month Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Billing Month</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Payout Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="PAID">Paid Only</option>
            </select>
          </div>

          {/* Trainer Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Trainer</label>
            <select
              value={filterTrainerId}
              onChange={(e) => setFilterTrainerId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All Trainers</option>
              {trainers.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.user?.fullName || t.name || `Trainer (${t.id.slice(0, 6)})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {payouts.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title={hasActiveFilters ? "No Matching Payout Records" : "No Payouts Recorded"}
          description={
            hasActiveFilters
              ? "Try selecting a different month, status, or trainer filter to view results."
              : "Schedule or disburse monthly salary and fixed stipends for your fitness coaches."
          }
          actionLabel={hasActiveFilters ? "Reset Filters" : "Record New Payout"}
          onAction={hasActiveFilters ? handleClearFilters : () => setIsCreateOpen(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Trainer</th>
                  <th className="py-4 px-6">Payout Month</th>
                  <th className="py-4 px-6">Receiving Account</th>
                  <th className="py-4 px-6">Amount (BDT)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Tx Reference</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {payouts.map((payout: TrainerPayout) => {
                  const trainerName = (payout as any).trainer?.user?.fullName || (payout as any).trainer?.name || 'Trainer';
                  const isPaid = payout.status === 'PAID';
                  const accounts = (payout as any).trainer?.paymentAccounts || [];
                  const defaultAcc = accounts.find((a: any) => a.isDefault) || accounts[0];

                  return (
                    <tr key={payout.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="font-bold text-white">{trainerName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        {payout.year && payout.month
                          ? `${new Date(Number(payout.year), Number(payout.month) - 1).toLocaleString('default', { month: 'short' })} ${payout.year}`
                          : String(payout.month)}
                      </td>
                      <td className="py-4 px-6">
                        {defaultAcc ? (
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    defaultAcc.accountType === 'BKASH'
                                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                      : defaultAcc.accountType === 'NAGAD'
                                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  }`}
                                >
                                  {defaultAcc.accountType}
                                </span>
                                <span className="font-mono text-xs font-semibold text-slate-200">
                                  {defaultAcc.accountNumber}
                                </span>
                              </div>
                              {defaultAcc.accountType === 'BANK' && defaultAcc.bankName && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[150px]" title={defaultAcc.bankName}>
                                  {defaultAcc.bankName}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(defaultAcc.accountNumber)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Copy account number"
                            >
                              {copiedText === defaultAcc.accountNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No account added</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(payout.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={payout.status} />
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {(payout as any).transactionReference || '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isPaid && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setErrorMessage(null);
                              setMarkingPayoutId(payout.id);
                              setTxRef('');
                            }}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            Mark Paid
                          </Button>
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

      {/* Record Payout Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Trainer Payout"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Select
            label="Select Trainer *"
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            options={[
              { value: '', label: '-- Choose a Trainer --' },
              ...trainers.map((t: any) => ({
                value: t.id,
                label: t.user?.fullName || t.name || `Trainer (${t.id.slice(0, 6)})`,
              })),
            ]}
            required
          />

          {/* Trainer receiving account preview */}
          {(() => {
            const selectedTrainer = trainers.find((t: any) => t.id === trainerId);
            if (!selectedTrainer) return null;

            const accounts = selectedTrainer.paymentAccounts || [];
            const defaultAcc = accounts.find((a: any) => a.isDefault) || accounts[0];

            if (defaultAcc) {
              return (
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {defaultAcc.accountType === 'BANK' ? (
                      <Landmark className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    )}
                    <span className="text-slate-400">Receiving via:</span>
                    <span className="font-bold text-white">{defaultAcc.accountType}</span>
                    <span className="font-mono text-slate-300 font-semibold">({defaultAcc.accountNumber})</span>
                  </div>
                  {defaultAcc.accountName && (
                    <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
                      {defaultAcc.accountName}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>No payout receiving account set by this trainer yet.</span>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Billing Month (YYYY-MM) *"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />

            <Input
              label="Amount (BDT ৳) *"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25000"
              required
            />
          </div>

          <Input
            label="Internal Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. September Base Retainer + Performance Bonus"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Save Payout Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal
        isOpen={!!markingPayoutId}
        onClose={() => setMarkingPayoutId(null)}
        title="Confirm Disbursement"
      >
        <form onSubmit={handleConfirmMarkPaid} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-sm text-slate-300">
            Confirm that the funds have been successfully transferred to the trainer.
          </p>

          {/* Trainer destination payment account card */}
          {(() => {
            const currentPayout = payouts.find((p) => p.id === markingPayoutId);
            const accounts = (currentPayout as any)?.trainer?.paymentAccounts || [];
            const defaultAcc = accounts.find((a: any) => a.isDefault) || accounts[0];

            if (defaultAcc) {
              return (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Trainer Payout Receiving Account
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        defaultAcc.accountType === 'BKASH'
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : defaultAcc.accountType === 'NAGAD'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {defaultAcc.accountType}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {defaultAcc.accountType === 'BANK' ? (
                          <Landmark className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-pink-400 shrink-0" />
                        )}
                        <span className="font-mono text-base font-bold text-white tracking-wide">
                          {defaultAcc.accountNumber}
                        </span>
                      </div>
                      {defaultAcc.accountName && (
                        <p className="text-xs text-slate-300">
                          Account Name: <span className="font-medium text-white">{defaultAcc.accountName}</span>
                        </p>
                      )}
                      {defaultAcc.accountType === 'BANK' && (
                        <div className="text-xs text-slate-400 space-y-0.5 pt-0.5">
                          {defaultAcc.bankName && <p>Bank: {defaultAcc.bankName}</p>}
                          {defaultAcc.branchName && <p>Branch: {defaultAcc.branchName}</p>}
                          {defaultAcc.routingNumber && <p>Routing: {defaultAcc.routingNumber}</p>}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(defaultAcc.accountNumber)}
                      className="shrink-0 text-xs gap-1.5"
                    >
                      {copiedText === defaultAcc.accountNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Trainer has not configured a payout account yet. Please confirm payment details directly with the trainer.
                </span>
              </div>
            );
          })()}

          <Input
            label="Bank / MFS Transaction Reference"
            value={txRef}
            onChange={(e) => setTxRef(e.target.value)}
            placeholder="e.g. BKASH-TXN-98412 or Bank Ref 10094"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMarkingPayoutId(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={markPaidMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Paid
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

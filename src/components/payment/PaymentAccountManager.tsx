'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  paymentAccountApi,
  CreatePaymentAccountDto,
} from '@/lib/api/paymentAccount.api';
import {
  PaymentAccount,
  PaymentAccountType,
} from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, CardSkeleton } from '@/components/ui/EmptyState';
import {
  Landmark,
  Smartphone,
  Plus,
  Trash2,
  Check,
  Copy,
  Star,
  Search,
  AlertCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PaymentAccountManagerProps {
  title?: string;
  subtitle?: string;
  roleHint?: string;
}

export function PaymentAccountManager({
  title = 'Payment Receiving Accounts',
  subtitle = 'Manage bank accounts and mobile financial services (bKash, Nagad) used to receive payments.',
  roleHint,
}: PaymentAccountManagerProps) {
  const queryClient = useQueryClient();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<PaymentAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [accountType, setAccountType] = useState<PaymentAccountType>('BKASH');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Fetch accounts
  const { data: accountsRes, isLoading, error } = useQuery({
    queryKey: ['payment-accounts', typeFilter, searchTerm],
    queryFn: async () => {
      const res = await paymentAccountApi.getAll({
        accountType: typeFilter !== 'ALL' ? (typeFilter as PaymentAccountType) : undefined,
        searchTerm: searchTerm.trim() || undefined,
      });
      return res.data;
    },
  });

  const accounts: PaymentAccount[] = Array.isArray(accountsRes?.data)
    ? accountsRes.data
    : (accountsRes as any)?.data?.data || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentAccountDto) => paymentAccountApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      closeAddModal();
    },
    onError: (err: any) => {
      setFormError(
        err.response?.data?.message || 'Failed to create payment account. Please verify your inputs.'
      );
    },
  });

  // Set Default Mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => paymentAccountApi.update(id, { isDefault: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentAccountApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      setAccountToDelete(null);
    },
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setFormError(null);
    setAccountName('');
    setAccountNumber('');
    setBankName('');
    setBranchName('');
    setRoutingNumber('');
    setIsDefault(false);
    setAccountType('BKASH');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!accountName.trim() || !accountNumber.trim()) {
      setFormError('Account name and account number are required.');
      return;
    }

    if (accountType === 'BANK') {
      if (!bankName.trim()) {
        setFormError('Bank name is required for bank transfer accounts.');
        return;
      }
    } else {
      // Mobile wallet (bKash / Nagad) validation: 11 digits
      const phoneRegex = /^01[3-9]\d{8}$/;
      const cleaned = accountNumber.replace(/[\s-]/g, '');
      if (!phoneRegex.test(cleaned)) {
        setFormError('Mobile wallet number must be a valid 11-digit Bangladeshi number (e.g. 017XXXXXXXX).');
        return;
      }
    }

    createMutation.mutate({
      accountType,
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: accountType === 'BANK' ? bankName.trim() : undefined,
      branchName: accountType === 'BANK' && branchName.trim() ? branchName.trim() : undefined,
      routingNumber: accountType === 'BANK' && routingNumber.trim() ? routingNumber.trim() : undefined,
      isDefault,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {subtitle}
          </p>
          {roleHint && (
            <span className="inline-block mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/50">
              {roleHint}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Add Payment Account
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'BANK', 'BKASH', 'NAGAD'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                typeFilter === type
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {type === 'ALL' ? 'All Accounts' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No Payment Accounts Configured"
          description={
            searchTerm || typeFilter !== 'ALL'
              ? 'No payment accounts match your active filters.'
              : 'Add your bank details or mobile financial accounts (bKash/Nagad) to start receiving payments.'
          }
          actionLabel="Add Account Now"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const isBank = acc.accountType === 'BANK';
            const isBkash = acc.accountType === 'BKASH';
            const isNagad = acc.accountType === 'NAGAD';

            return (
              <div
                key={acc.id}
                className={cn(
                  'relative rounded-2xl p-5 border transition-all duration-200 shadow-sm flex flex-col justify-between overflow-hidden',
                  isBank &&
                    'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white',
                  isBkash &&
                    'bg-gradient-to-br from-[#e2136e]/10 via-slate-900 to-slate-900 border-[#e2136e]/40 dark:border-[#e2136e]/30 text-white',
                  isNagad &&
                    'bg-gradient-to-br from-[#f7941d]/10 via-slate-900 to-slate-900 border-[#f7941d]/40 dark:border-[#f7941d]/30 text-white'
                )}
              >
                {/* Decorative background glow */}
                {isBkash && (
                  <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-[#e2136e]/10 rounded-full blur-2xl pointer-events-none" />
                )}
                {isNagad && (
                  <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-[#f7941d]/10 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Top Row: Type Pill, Default Badge, Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase',
                          isBank && 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
                          isBkash && 'bg-[#e2136e]/20 text-[#ff7cb4] border border-[#e2136e]/40',
                          isNagad && 'bg-[#f7941d]/20 text-[#ffb86c] border border-[#f7941d]/40'
                        )}
                      >
                        {isBank ? (
                          <Landmark className="w-3.5 h-3.5" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5" />
                        )}
                        {acc.accountType}
                      </span>

                      {acc.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-300" />
                          Default
                        </span>
                      )}
                    </div>

                    <StatusBadge status={acc.status} />
                  </div>

                  {/* Account Name / Organization */}
                  <h3 className="text-base font-bold text-white tracking-tight truncate">
                    {acc.accountName}
                  </h3>

                  {/* Account Number with 1-click Copy */}
                  <div className="mt-3 flex items-center justify-between gap-2 bg-black/30 border border-white/10 rounded-xl px-3.5 py-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-100 tracking-wider">
                      {acc.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(acc.accountNumber, acc.id)}
                      title="Copy Account Number"
                      className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {copiedId === acc.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Bank Details (if Bank Account) */}
                  {isBank && (
                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      {acc.bankName && (
                        <p className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-white">{acc.bankName}</span>
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-400 pt-0.5">
                        {acc.branchName && <span>Branch: {acc.branchName}</span>}
                        {acc.routingNumber && <span>Routing: {acc.routingNumber}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  {!acc.isDefault && acc.status === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDefaultMutation.mutate(acc.id)}
                      isLoading={setDefaultMutation.isPending}
                      className="text-xs text-slate-300 hover:text-white hover:bg-white/10 -ml-2"
                    >
                      Set as Default
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAccountToDelete(acc)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 h-auto rounded-lg"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add Payment Account"
        description="Add a verified account to receive incoming customer or platform payments."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Method *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'BKASH', label: 'bKash', icon: Smartphone, color: 'hover:border-[#e2136e]' },
                { type: 'NAGAD', label: 'Nagad', icon: Smartphone, color: 'hover:border-[#f7941d]' },
                { type: 'BANK', label: 'Bank', icon: Landmark, color: 'hover:border-blue-500' },
              ].map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setAccountType(type as PaymentAccountType);
                    setFormError(null);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                    accountType === type
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
                    color
                  )}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Holder Name */}
          <Input
            label="Account Holder Name *"
            placeholder={
              accountType === 'BANK'
                ? 'e.g. Iron Forge Fitness Ltd.'
                : 'e.g. Gym Reception / Admin'
            }
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />

          {/* Account Number */}
          <Input
            label={accountType === 'BANK' ? 'Account Number *' : 'Mobile Wallet Number *'}
            placeholder={
              accountType === 'BANK' ? 'e.g. 151.110.345678' : 'e.g. 01712345678'
            }
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            helperText={
              accountType !== 'BANK'
                ? 'Enter 11-digit Bangladeshi mobile number (Personal or Merchant).'
                : undefined
            }
            required
          />

          {/* Conditional Bank Fields */}
          {accountType === 'BANK' && (
            <>
              <Input
                label="Bank Name *"
                placeholder="e.g. Dutch-Bangla Bank, City Bank, BRAC Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Branch Name"
                  placeholder="e.g. Dhanmondi Branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />
                <Input
                  label="Routing Number"
                  placeholder="e.g. 090271675"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Default Account Checkbox */}
          <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Set as primary default receiving account</span>
          </label>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Save Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={() => {
          if (accountToDelete) {
            deleteMutation.mutate(accountToDelete.id);
          }
        }}
        title="Delete Payment Account"
        description={`Are you sure you want to remove the ${accountToDelete?.accountType} account ending in ${accountToDelete?.accountNumber.slice(-4)}? Any incoming payment instructions referencing this account may be affected.`}
        confirmText="Delete Account"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

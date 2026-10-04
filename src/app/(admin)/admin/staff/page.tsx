'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Mail, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users
} from 'lucide-react';

export default function AdminStaffPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'SUSPENDED' | 'ALL'>('ACTIVE');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissionScope, setPermissionScope] = useState('SUPPORT');

  const { data: staffRes, isLoading } = useQuery({
    queryKey: ['admin-platform-staff', statusFilter],
    queryFn: () => adminApi.getStaff({ status: statusFilter }),
  });

  const staffList = staffRes?.data?.data || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      fullName: string;
      email: string;
      password?: string;
      role: 'ADMIN' | 'STAFF';
      permissionScope: string;
    }) => adminApi.createStaff(data),
    onSuccess: () => {
      setIsAddOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setPermissionScope('SUPPORT');
      setErrorMessage(null);
      setSuccessMessage('Platform operator created successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-platform-staff'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to add operator account.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteStaff(id),
    onSuccess: () => {
      setDeletingId(null);
      setErrorMessage(null);
      setSuccessMessage('Operator removed successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-platform-staff'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to remove operator account.');
    }
  });

  // Reactivate Mutation
  const reactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.updateStaff(id, { status: 'ACTIVE' }),
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage('Operator reactivated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-platform-staff'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to reactivate operator.');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const trimmedName = fullName.trim();
    const role: 'ADMIN' | 'STAFF' = permissionScope === 'FULL_ACCESS' ? 'ADMIN' : 'STAFF';

    createMutation.mutate({
      name: trimmedName,
      fullName: trimmedName,
      email: email.trim().toLowerCase(),
      password: password.trim() || undefined,
      role,
      permissionScope,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Operators & Staff</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage administrative personnel, tier access controls, and customer success agents.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setSuccessMessage(null);
            setIsAddOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Operator
        </Button>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="text-xs text-rose-400/80 hover:text-rose-200 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessMessage(null)} 
            className="text-xs text-emerald-400/80 hover:text-emerald-200 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Active Staff
        </button>
        <button
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'SUSPENDED'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Suspended
        </button>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          All Accounts
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <TableSkeleton rows={4} />
        </div>
      ) : staffList.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={statusFilter === 'SUSPENDED' ? 'No Suspended Operators' : 'No Operators Found'}
          description={
            statusFilter === 'SUSPENDED'
              ? 'No staff accounts are currently deactivated or suspended.'
              : 'You can delegate compliance auditing and dispute arbitration to designated platform staff.'
          }
          actionLabel={statusFilter === 'ACTIVE' ? 'Add Operator Account' : undefined}
          onAction={statusFilter === 'ACTIVE' ? () => setIsAddOpen(true) : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Operator</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Platform Role</th>
                  <th className="py-4 px-6">Permissions</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {staffList.map((st: any) => (
                  <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                          {(st.name || st.fullName || 'ST').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-white">{st.name || st.fullName || st.user?.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{st.email || st.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-purple-300">
                        {st.role || 'STAFF'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {st.permissions && st.permissions.length > 0 ? (
                        <span className="text-xs text-slate-300">
                          {st.permissions.length} access policies
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Default</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {st.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {st.status === 'SUSPENDED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setErrorMessage(null);
                              setSuccessMessage(null);
                              reactivateMutation.mutate(st.id);
                            }}
                            isLoading={reactivateMutation.isPending && reactivateMutation.variables === st.id}
                            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                            className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                          >
                            Reactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            setDeletingId(st.id);
                          }}
                          isLoading={deleteMutation.isPending && deleteMutation.variables === st.id}
                          leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                          className="text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Platform Staff Operator"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Tanvir Hasan"
            required
          />

          <Input
            label="Operator Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tanvir@gymsaas.com"
            required
          />

          <Input
            label="Initial Password (Optional)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters (or leave blank to auto-generate)"
            helperText="Leave empty to automatically assign a secure temporary password."
          />

          <Select
            label="Administrative Scope *"
            value={permissionScope}
            onChange={(e) => setPermissionScope(e.target.value)}
            options={[
              { value: 'SUPPORT', label: 'Support Agent (Disputes & Tickets)' },
              { value: 'COMPLIANCE', label: 'Compliance Officer (Gym & Certification Audits)' },
              { value: 'BILLING', label: 'Billing Specialist (Payments & Gateways)' },
              { value: 'FULL_ACCESS', label: 'Operations Admin (Full Permissions)' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Add Operator
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Staff Account?"
        description="This operator will immediately lose access to the Super Admin panel and their account will be removed."
        confirmLabel="Remove Operator"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  Users, 
  Search, 
  UserCheck, 
  Ban, 
  Mail, 
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { User, Role } from '@/types/api.types';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch platform users
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, statusFilter, search],
    queryFn: () => adminApi.getUsers({
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      search: search || undefined,
    }),
  });

  const users = usersRes?.data?.data || [];

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update user status.');
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform User Accounts</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Unified directory of gym owners, certified fitness coaches, gym members, and administrative staff.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by full name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'MEMBER', label: 'Members' },
              { value: 'TRAINER', label: 'Trainers' },
              { value: 'BUSINESS_OWNER', label: 'Gym Owners' },
              { value: 'STAFF', label: 'Staff' },
              { value: 'SUPER_ADMIN', label: 'Super Admins' },
            ]}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Account Statuses' },
              { value: 'ACTIVE', label: 'Active Only' },
              { value: 'SUSPENDED', label: 'Suspended Only' },
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Matching Accounts Found"
          description="Try broadening your search term or adjusting role/status filters."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Platform Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((u: User) => {
                  const isActive = (u as any).isActive !== false && u.status !== 'SUSPENDED';

                  const getRoleBadge = (role: string) => {
                    switch (role) {
                      case 'SUPER_ADMIN':
                        return { label: 'Super Admin', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
                      case 'BUSINESS_OWNER':
                        return { label: 'Gym Owner', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
                      case 'TRAINER':
                        return { label: 'Trainer', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
                      case 'MEMBER':
                        return { label: 'Member', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
                      case 'STAFF':
                        return { label: 'Staff', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
                      case 'ADMIN':
                        return { label: 'Admin', className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
                      default:
                        return { label: role, className: 'bg-slate-800 text-slate-300 border-slate-700' };
                    }
                  };

                  const roleBadge = getRoleBadge(u.role);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {u.profileImage ? (
                            <img
                              src={u.profileImage}
                              alt={u.fullName || 'User'}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                              {u.fullName ? u.fullName.slice(0, 2).toUpperCase() : 'US'}
                            </div>
                          )}
                          <span className="font-bold text-white">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.className}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {u.role === 'SUPER_ADMIN' ? (
                          <span className="text-xs text-slate-500 font-medium px-2.5 py-1 rounded-md bg-slate-800/40 border border-slate-700/50 inline-block">
                            Protected
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={isActive ? 'ghost' : 'outline'}
                            onClick={() => statusMutation.mutate({ id: u.id, isActive: !isActive })}
                            isLoading={statusMutation.isPending && (statusMutation.variables as any)?.id === u.id}
                            leftIcon={isActive ? <Ban className="w-3.5 h-3.5 text-rose-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                            className={`text-xs ${isActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400'}`}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
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
    </div>
  );
}

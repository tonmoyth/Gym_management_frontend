'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { staffApi } from '@/lib/api/staff.api';
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
  Edit3, 
  Mail, 
  AlertCircle 
} from 'lucide-react';
import { BusinessStaff, StaffPermissionRole } from '@/types/api.types';

const ROLE_OPTIONS = [
  { value: 'FRONT_DESK', label: 'Front Desk (Check-ins, Attendance, Member Roster & Classes)' },
  { value: 'MEMBER_MANAGER', label: 'Member Manager (Membership Plans, Bookings, Enrollments & Attendance)' },
  { value: 'TRAINER_MANAGER', label: 'Trainer Manager (Trainer Roster, Job Listings, Classes & Equipment)' },
  { value: 'FINANCE', label: 'Finance (Trainer Payouts, Financial & Revenue Reports)' },
  { value: 'FULL', label: 'Full Access (All Operational & Financial Gym Management)' },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  FRONT_DESK: { label: 'Front Desk', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  RECEPTIONIST: { label: 'Front Desk', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  MEMBER_MANAGER: { label: 'Member Manager', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  TRAINER_MANAGER: { label: 'Trainer Manager', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  TRAINER_COORDINATOR: { label: 'Trainer Manager', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  FINANCE: { label: 'Finance', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  FULL: { label: 'Full Access', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  MANAGER: { label: 'Full Access', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function OwnerStaffPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<BusinessStaff | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [permissionRole, setPermissionRole] = useState<StaffPermissionRole>('FRONT_DESK');

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch staff accounts
  const { data: staffRes, isLoading: isStaffLoading } = useQuery({
    queryKey: ['business-staff', businessId],
    queryFn: () => staffApi.listByBusiness(businessId!),
    enabled: !!businessId,
  });

  const staffList = staffRes?.data?.data || [];

  // Add Staff Mutation
  const addMutation = useMutation({
    mutationFn: (data: { email: string; permissionRole: StaffPermissionRole }) =>
      staffApi.addStaff(businessId!, data),
    onSuccess: () => {
      setIsAddOpen(false);
      setEmail('');
      setPermissionRole('FRONT_DESK');
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to add staff member.');
    }
  });

  // Update Permission Mutation
  const updateMutation = useMutation({
    mutationFn: ({ staffId, role }: { staffId: string; role: StaffPermissionRole }) =>
      staffApi.updatePermission(businessId!, staffId, role),
    onSuccess: () => {
      setEditingStaff(null);
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update permissions.');
    }
  });

  // Remove Staff Mutation
  const removeMutation = useMutation({
    mutationFn: (staffId: string) => staffApi.removeStaff(businessId!, staffId),
    onSuccess: () => {
      setDeletingStaffId(null);
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    addMutation.mutate({ email, permissionRole });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setErrorMessage(null);
    updateMutation.mutate({ staffId: editingStaff.id, role: permissionRole });
  };

  if (isBusinessLoading || isStaffLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Staff & Sub-Accounts</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Delegate front-desk operations, booking verification, and class scheduling to gym staff.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setEmail('');
            setPermissionRole('FRONT_DESK');
            setIsAddOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Staff Member
        </Button>
      </div>

      {staffList.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Staff Accounts Created"
          description="Grant front-desk receptionists or operational managers access to check-in logs and member bookings."
          actionLabel="Add First Staff Account"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Staff Member</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Access Role</th>
                  <th className="py-4 px-6">Added On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {staffList.map((staff: BusinessStaff) => {
                  const user = (staff as any).user;
                  const fullName = user?.fullName || 'Gym Staff';
                  const staffEmail = user?.email || (staff as any).email || 'N/A';
                  const roleInfo = ROLE_LABELS[staff.permissionRole] || {
                    label: staff.permissionRole,
                    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  };

                  return (
                    <tr key={staff.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                            {fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-white">{fullName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{staffEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingStaff(staff);
                              setPermissionRole(staff.permissionRole);
                              setErrorMessage(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="Edit Permissions"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStaffId(staff.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Remove Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Staff Member"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Staff Member Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@gym.com"
            helperText="The user must already be registered on the platform."
            required
          />

          <Select
            label="Permission Level *"
            value={permissionRole}
            onChange={(e) => setPermissionRole(e.target.value as StaffPermissionRole)}
            options={ROLE_OPTIONS}
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
              isLoading={addMutation.isPending}
            >
              Add Staff
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        title="Update Staff Permissions"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Select
            label="Permission Level *"
            value={permissionRole}
            onChange={(e) => setPermissionRole(e.target.value as StaffPermissionRole)}
            options={ROLE_OPTIONS}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingStaff(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateMutation.isPending}
            >
              Update Permissions
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingStaffId}
        onClose={() => setDeletingStaffId(null)}
        onConfirm={() => deletingStaffId && removeMutation.mutate(deletingStaffId)}
        title="Revoke Staff Access?"
        description="This user will immediately lose access to your gym's owner portal and administrative functions."
        confirmLabel="Revoke Access"
        variant="danger"
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}

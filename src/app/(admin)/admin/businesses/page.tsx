'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
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
  Clock 
} from 'lucide-react';
import { Business } from '@/types/api.types';

export default function AdminBusinessesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [rejectingGym, setRejectingGym] = useState<Business | null>(null);
  const [suspendingGymId, setSuspendingGymId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch pending businesses
  const { data: pendingRes, isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin-pending-businesses'],
    queryFn: () => adminApi.getPendingBusinesses(),
    enabled: activeTab === 'pending',
  });

  const pendingGyms = pendingRes?.data?.data || [];

  // 2. Fetch all businesses
  const { data: allRes, isLoading: isAllLoading } = useQuery({
    queryKey: ['admin-all-businesses'],
    queryFn: () => adminApi.getAllBusinesses(),
    enabled: activeTab === 'all',
  });

  const allGyms = allRes?.data?.data || [];

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err: any) => {
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
            Approve trade credentials for new gyms, oversee facility listings, and enforce compliance suspensions.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : pendingGyms.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All Gym Applications Reviewed"
              description="No pending gym registrations waiting for verification in the queue."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingGyms.map((gym: Business) => (
                <div
                  key={gym.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
                >
                  <div>
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

                    <div className="space-y-1.5 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-400">
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
                      <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                        {gym.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => approveMutation.mutate(gym.id)}
                      isLoading={approveMutation.isPending}
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
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
                      className="flex-1 text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      Reject Application
                    </Button>
                  </div>
                </div>
              ))}
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
                        <p>Owner ID: <span className="font-mono text-slate-300">{gym.ownerId?.slice(0, 8)}...</span></p>
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
            placeholder="e.g. Invalid trade license number or unverified physical address provided."
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

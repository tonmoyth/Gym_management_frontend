'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeApi, CreateDisputeInput } from '@/lib/api/dispute.api';
import { trainerApi } from '@/lib/api/trainer.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  AlertTriangle, 
  Plus, 
  AlertCircle,
  Check,
} from 'lucide-react';
import { Dispute, DisputeCategory } from '@/types/api.types';

export default function TrainerDisputesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<DisputeCategory>('PAYOUT');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [businessId, setBusinessId] = useState('');

  // 1. Fetch own disputes
  const { data: disputesRes, isLoading } = useQuery({
    queryKey: ['my-disputes'],
    queryFn: () => disputeApi.getMyDisputes(),
  });

  const disputes = disputesRes?.data?.data || [];

  // 2. Fetch trainer's affiliated gyms for easy business selection
  const { data: profileRes } = useQuery({
    queryKey: ['trainer-profile-me'],
    queryFn: () => trainerApi.getOwnProfile(),
  });

  const rawBusinesses = profileRes?.data?.data?.businesses || [];
  const affiliatedBusinesses = Array.isArray(rawBusinesses)
    ? rawBusinesses.map((b: any) => ({
        id: b.business?.id || b.businessId || b.id,
        name: b.business?.name || 'Affiliated Gym',
      }))
    : [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateDisputeInput) => disputeApi.create(data),
    onSuccess: () => {
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      setBusinessId('');
      setCategory('PAYOUT');
      setSuccessMessage('Dispute submitted for Super Admin review.');
      setTimeout(() => setSuccessMessage(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['my-disputes'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to submit dispute.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanBusinessId = businessId && businessId.trim() !== '' ? businessId.trim() : undefined;

    const payload: CreateDisputeInput = {
      category,
      subject: subject.trim(),
      description: description.trim(),
      ...(cleanBusinessId ? { businessId: cleanBusinessId } : {}),
    };

    createMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Disputes & Escalations</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Report payout discrepancies, contract issues, or facility violations directly to platform arbitration.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Raise Dispute
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {disputes.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No Active Disputes"
          description="If you experience payout defaults or contract breaches with a gym, raise an escalation here."
          actionLabel="File Escalation"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Dispute Subject</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Date Filed</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {disputes.map((d: Dispute) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-white">{d.subject || 'Coaching Escalation'}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{d.description}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                        {d.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raise Dispute Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Platform Dispute"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Select
            label="Dispute Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value as DisputeCategory)}
            options={[
              { value: 'PAYOUT', label: 'Payout / Unpaid Coach Retainer' },
              { value: 'BILLING', label: 'Billing / Subscription Discrepancy' },
              { value: 'SERVICE', label: 'Gym Facility Misconduct / Unsafe Conditions' },
              { value: 'CONDUCT', label: 'Client / Staff Misconduct' },
              { value: 'OTHER', label: 'Other Grievance' },
            ]}
          />

          <Input
            label="Subject Summary *"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Unpaid Monthly Retainer for August"
            required
          />

          {/* Affiliated Gym Selector (if available) or Manual Gym ID */}
          {affiliatedBusinesses.length > 0 ? (
            <div className="space-y-1.5">
              <label
                htmlFor="dispute-facility-select"
                className="block text-xs font-semibold text-slate-300"
              >
                Related Gym Facility (Optional)
              </label>
              <select
                id="dispute-facility-select"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-teal-500 rounded-xl text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
              >
                <option value="">-- None (Platform-wide issue) --</option>
                {affiliatedBusinesses.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label="Gym Business ID (Optional)"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="e.g. 123e4567-..."
            />
          )}

          <Textarea
            label="Detailed Explanation *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide dates, amounts, agreements, and details for Super Admin arbitration..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Submit Dispute
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

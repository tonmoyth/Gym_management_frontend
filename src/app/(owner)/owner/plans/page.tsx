'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { membershipPlanApi, CreatePlanInput } from '@/lib/api/membershipPlan.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  ShieldCheck, 
  Plus, 
  Check, 
  Archive, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import { MembershipPlan } from '@/types/api.types';

export default function OwnerPlansPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [archivingPlanId, setArchivingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [benefitInput, setBenefitInput] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);

  // 1. Fetch current owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch membership plans
  const { data: plansRes, isLoading: isPlansLoading } = useQuery({
    queryKey: ['business-plans', businessId],
    queryFn: () => membershipPlanApi.listByBusiness(businessId!),
    enabled: !!businessId,
  });

  const plans = plansRes?.data?.data || [];

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setBenefits(prev => [...prev, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(prev => prev.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDurationDays('30');
    setBenefits([
      'Full Gym & Cardio Area Access',
      'Locker & Shower Facilities'
    ]);
    setErrorMessage(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description || '');
    setPrice(plan.price.toString());
    setDurationDays(plan.durationDays.toString());
    setBenefits(plan.benefits || []);
    setErrorMessage(null);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePlanInput) => membershipPlanApi.create(businessId!, data),
    onSuccess: () => {
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['business-plans', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create plan.');
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreatePlanInput>) =>
      membershipPlanApi.update(businessId!, editingPlan!.id, data),
    onSuccess: () => {
      setEditingPlan(null);
      queryClient.invalidateQueries({ queryKey: ['business-plans', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update plan.');
    }
  });

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: (planId: string) => membershipPlanApi.archive(businessId!, planId),
    onSuccess: () => {
      setArchivingPlanId(null);
      queryClient.invalidateQueries({ queryKey: ['business-plans', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to archive plan.');
    }
  });

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: CreatePlanInput = {
      name,
      description,
      price: parseFloat(price),
      durationDays: parseInt(durationDays, 10),
      benefits,
    };

    if (editingPlan) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isBusinessLoading || isPlansLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Membership Plans</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Create and manage recurring or fixed subscription tiers for your gym members.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Membership Plans Yet"
          description="Design your first subscription tier (e.g. Monthly Standard, Quarterly Pro) so members can join your gym."
          actionLabel="Create Plan"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isArchived = plan.status === 'ARCHIVED';
            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  isArchived
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {plan.durationDays} Days Duration
                    </span>
                    <StatusBadge status={plan.status} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-slate-400 text-xs mb-4 line-clamp-2">{plan.description}</p>
                  )}

                  <div className="my-5 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">{formatCurrency(plan.price)}</span>
                      <span className="text-xs text-slate-400 font-medium">/ {plan.durationDays} days</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Included Benefits:
                    </p>
                    {plan.benefits && plan.benefits.length > 0 ? (
                      <ul className="space-y-1.5">
                        {plan.benefits.map((b, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No specific perks listed</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(plan)}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs"
                    disabled={isArchived}
                  >
                    Edit
                  </Button>
                  {!isArchived && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setArchivingPlanId(plan.id)}
                      leftIcon={<Archive className="w-3.5 h-3.5 text-rose-400" />}
                      className="text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingPlan}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingPlan(null);
        }}
        title={editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
      >
        <form onSubmit={handleSavePlan} className="space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Plan Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 1 Month Standard, VIP Annual Pass"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (BDT ৳) *"
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 2500"
              required
            />
            <Input
              label="Duration (in Days) *"
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="30"
              required
            />
          </div>

          <Textarea
            label="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summary of this membership tier..."
            rows={2}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Benefits & Privileges
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                placeholder="e.g. Free Nutrition Assessment"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddBenefit}>
                Add
              </Button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 bg-slate-800/80 rounded-lg text-slate-300"
                >
                  <span>{b}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="text-slate-500 hover:text-rose-400 font-bold ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingPlan(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPlan ? 'Update Plan' : 'Save Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!archivingPlanId}
        onClose={() => setArchivingPlanId(null)}
        onConfirm={() => archivingPlanId && archiveMutation.mutate(archivingPlanId)}
        title="Archive Membership Plan?"
        description="Archiving will hide this plan from new bookings. Members currently enrolled in this plan will remain unaffected until their period expires."
        confirmLabel="Archive Plan"
        variant="danger"
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
}

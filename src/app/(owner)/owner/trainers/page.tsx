'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { trainerApi } from '@/lib/api/trainer.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  Award, 
  Star, 
  CheckCircle2, 
  Trash2, 
  Briefcase, 
  UserX,
  Mail,
  Plus,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { TrainerProfile } from '@/types/api.types';

export default function OwnerTrainersPage() {
  const queryClient = useQueryClient();
  const [removingTrainerId, setRemovingTrainerId] = useState<string | null>(null);

  // 1. Fetch current owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch gym trainers
  const { data: trainersRes, isLoading: isTrainersLoading } = useQuery({
    queryKey: ['business-trainers', businessId],
    queryFn: () => trainerApi.getBusinessTrainers(businessId!),
    enabled: !!businessId,
  });

  const trainers = trainersRes?.data?.data || [];

  const [isDirectAddOpen, setIsDirectAddOpen] = useState(false);
  const [directTrainerId, setDirectTrainerId] = useState('');
  const [directSalary, setDirectSalary] = useState('');
  const [editingTrainer, setEditingTrainer] = useState<TrainerProfile | null>(null);
  const [editSalary, setEditSalary] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch all available platform trainers for direct addition
  const { data: allPlatformTrainersRes } = useQuery({
    queryKey: ['all-platform-trainers'],
    queryFn: () => trainerApi.getAllTrainers({ limit: 100 }),
    enabled: isDirectAddOpen,
  });

  const platformTrainers = allPlatformTrainersRes?.data?.data || [];
  const currentTrainerIds = new Set(trainers.map((t: any) => t.id));
  const availableTrainers = platformTrainers.filter((t: any) => !currentTrainerIds.has(t.id));

  // Direct Add Mutation
  const directAddMutation = useMutation({
    mutationFn: (data: { trainerId: string; monthlySalary: number }) =>
      trainerApi.directAddTrainer(businessId!, data),
    onSuccess: () => {
      setIsDirectAddOpen(false);
      setDirectTrainerId('');
      setDirectSalary('');
      queryClient.invalidateQueries({ queryKey: ['business-trainers', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to add trainer.');
    },
  });

  // Update Salary Mutation
  const updateSalaryMutation = useMutation({
    mutationFn: ({ trainerId, monthlySalary }: { trainerId: string; monthlySalary: number }) =>
      trainerApi.updateSalary(businessId!, trainerId, { monthlySalary }),
    onSuccess: () => {
      setEditingTrainer(null);
      setEditSalary('');
      queryClient.invalidateQueries({ queryKey: ['business-trainers', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update salary.');
    },
  });

  // Remove Mutation
  const removeMutation = useMutation({
    mutationFn: (trainerId: string) =>
      trainerApi.removeTrainerFromBusiness(businessId!, trainerId),
    onSuccess: () => {
      setRemovingTrainerId(null);
      queryClient.invalidateQueries({ queryKey: ['business-trainers', businessId] });
    },
  });

  if (isBusinessLoading || isTrainersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h1 className="text-3xl font-black text-white tracking-tight">Trainer Roster</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage your certified coaches and personal training staff attached to this gym.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setErrorMessage(null);
              setIsDirectAddOpen(true);
            }}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Direct Add Trainer
          </Button>
          <Button
            href="/owner/job-posts"
            variant="outline"
            leftIcon={<Briefcase className="w-4 h-4" />}
          >
            Job Postings
          </Button>
        </div>
      </div>

      {trainers.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Trainers Attached Yet"
          description="Create a job post on the platform to recruit certified personal trainers for your gym."
          actionLabel="Post a Trainer Job"
          href="/owner/job-posts"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer: TrainerProfile) => {
            const user = (trainer as any).user;
            const fullName = user?.fullName || 'Certified Trainer';
            const email = user?.email || '';
            const profilePhoto = user?.profileImage || (trainer as any).profilePhoto;

            return (
              <div
                key={trainer.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt={fullName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                          {fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white">{fullName}</h3>
                          {trainer.verifiedBadge && (
                            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" aria-label="Verified Badge" />
                          )}
                        </div>
                        {email && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{Number(trainer.avgRating) > 0 ? Number(trainer.avgRating).toFixed(1) : 'New'}</span>
                    </div>

                    {trainer.gender && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium capitalize">
                        {trainer.gender.toLowerCase()}
                      </span>
                    )}

                    {trainer.profileCompletionPercent !== undefined && (
                      <span className="text-xs text-slate-400">
                        {trainer.profileCompletionPercent}% Profile
                      </span>
                    )}
                  </div>

                  {trainer.bio && (
                    <p className="text-xs text-slate-300 line-clamp-3 mb-4 italic">
                      "{trainer.bio}"
                    </p>
                  )}

                  {/* Specialization Tags */}
                  {trainer.specializations && trainer.specializations.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Specialties:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {trainer.specializations.map((spec: any) => (
                          <span
                            key={spec.id || spec.tag?.id}
                            className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                          >
                            {spec.name || spec.tag?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Monthly Salary & Compensation Card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Monthly Compensation</span>
                      <p className="text-sm font-bold font-mono text-emerald-400">
                        {(trainer as any).monthlySalary ? `৳${Number((trainer as any).monthlySalary).toLocaleString()}/month` : 'Not Set'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setErrorMessage(null);
                        setEditingTrainer(trainer);
                        setEditSalary((trainer as any).monthlySalary ? String((trainer as any).monthlySalary) : '');
                      }}
                      className="text-xs h-7 px-2.5"
                    >
                      Edit Salary
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRemovingTrainerId(trainer.id)}
                    leftIcon={<UserX className="w-3.5 h-3.5 text-rose-400" />}
                    className="text-xs text-rose-400 hover:bg-rose-500/10"
                  >
                    Remove From Roster
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!removingTrainerId}
        onClose={() => setRemovingTrainerId(null)}
        onConfirm={() => removingTrainerId && removeMutation.mutate(removingTrainerId)}
        title="Remove Trainer from Gym?"
        description="This coach will no longer be attached to your gym. Any upcoming assigned classes will need to be reassigned."
        confirmLabel="Remove Trainer"
        variant="danger"
        isLoading={removeMutation.isPending}
      />

      {/* Direct Add Trainer Modal */}
      <Modal
        isOpen={isDirectAddOpen}
        onClose={() => setIsDirectAddOpen(false)}
        title="Directly Add Trainer to Gym"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            if (!directTrainerId) {
              setErrorMessage('Please select a trainer.');
              return;
            }
            directAddMutation.mutate({
              trainerId: directTrainerId,
              monthlySalary: parseFloat(directSalary) || 0,
            });
          }}
          className="space-y-4"
        >
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-sm text-slate-300">
            Add a personal coach to your gym roster without posting a public vacancy.
          </p>

          <Select
            label="Select Certified Trainer *"
            value={directTrainerId}
            onChange={(e) => setDirectTrainerId(e.target.value)}
            options={[
              { value: '', label: '-- Choose a Trainer from Platform --' },
              ...availableTrainers.map((t: any) => ({
                value: t.id,
                label: `${t.user?.fullName || t.name || 'Trainer'} (${t.user?.email || 'No email'})`,
              })),
            ]}
            required
          />

          <Input
            label="Monthly Salary (BDT ৳) *"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 25000"
            value={directSalary}
            onChange={(e) => setDirectSalary(e.target.value)}
            helperText="Monthly salary will automatically trigger pending payouts after 1 month of service."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDirectAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={directAddMutation.isPending}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add to Roster
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Salary Modal */}
      <Modal
        isOpen={!!editingTrainer}
        onClose={() => setEditingTrainer(null)}
        title="Update Trainer Monthly Salary"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            if (!editingTrainer) return;
            updateSalaryMutation.mutate({
              trainerId: editingTrainer.id,
              monthlySalary: parseFloat(editSalary) || 0,
            });
          }}
          className="space-y-4"
        >
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-sm text-slate-300">
            Update the agreed monthly retainer for{' '}
            <strong className="text-white">
              {(editingTrainer as any)?.user?.fullName || (editingTrainer as any)?.name || 'this trainer'}
            </strong>.
          </p>

          <Input
            label="New Monthly Salary (BDT ৳) *"
            type="number"
            min="0"
            step="any"
            value={editSalary}
            onChange={(e) => setEditSalary(e.target.value)}
            placeholder="e.g. 30000"
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingTrainer(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateSalaryMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Update Salary
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

'use strict';
'use client';

import React, { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostApi } from '@/lib/api/jobPost.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Mail, 
  Calendar, 
  ShieldCheck,
  Star,
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { TrainerApplication } from '@/types/api.types';

export default function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = use(params);
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [approvingApp, setApprovingApp] = useState<TrainerApplication | null>(null);
  const [hireSalary, setHireSalary] = useState<string>('');

  // 1. Fetch Job Post Details
  const { data: jobRes } = useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: () => jobPostApi.getById(jobId),
  });

  const job = jobRes?.data?.data;

  // 2. Fetch Applicants
  const { data: applicantsRes, isLoading } = useQuery({
    queryKey: ['job-applicants', jobId],
    queryFn: () => jobPostApi.getApplicants(jobId),
  });

  const applicants = applicantsRes?.data?.data || [];

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: ({ appId, monthlySalary }: { appId: string; monthlySalary?: number }) =>
      jobPostApi.approveApplication(appId, { monthlySalary }),
    onSuccess: () => {
      setApprovingApp(null);
      queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] });
      queryClient.invalidateQueries({ queryKey: ['business-trainers'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to approve application.');
    }
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: (appId: string) => jobPostApi.rejectApplication(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to reject application.');
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 border-b border-slate-800 pb-6">
        <Link
          href="/owner/job-posts"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Listings
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {job?.title || 'Job Applicants'}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Review and select certified fitness trainers applying for this position.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : applicants.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Applicants Yet"
          description="Verified personal trainers will appear here when they submit applications for this job opening."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applicants.map((app: any) => {
            const trainer = app.trainer;
            const user = trainer?.user || {};
            const fullName = user.name || user.fullName || 'Trainer Candidate';
            const email = user.email || 'N/A';
            const profilePhoto = user.profilePhoto || user.profileImage;
            const isPending = app.applicationStatus === 'PENDING';

            return (
              <div
                key={app.id}
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
                        <h3 className="text-base font-bold text-white">{fullName}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={app.applicationStatus} />
                  </div>

                  <div className="flex items-center gap-4 py-3 border-y border-slate-800/80 my-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>

                    {trainer?.experience !== undefined && (
                      <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {trainer.experience} yrs experience
                      </span>
                    )}
                  </div>

                  {trainer?.specializations && trainer.specializations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Specializations:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {trainer.specializations.map((spec: any) => (
                          <span
                            key={spec.id}
                            className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                          >
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isPending && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setErrorMessage(null);
                        setHireSalary(job?.salary ? String(job.salary) : '');
                        setApprovingApp(app);
                      }}
                      isLoading={approveMutation.isPending && approvingApp?.id === app.id}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs"
                    >
                      Approve & Hire
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(app.id)}
                      isLoading={rejectMutation.isPending}
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
                      className="flex-1 text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approve & Hire Salary Confirmation Modal */}
      <Modal
        isOpen={!!approvingApp}
        onClose={() => setApprovingApp(null)}
        title="Approve Application & Finalize Hiring"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!approvingApp) return;
            approveMutation.mutate({
              appId: approvingApp.id,
              monthlySalary: hireSalary ? parseFloat(hireSalary) : undefined,
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
            You are hiring{' '}
            <strong className="text-white">
              {(approvingApp as any)?.trainer?.user?.fullName || 'this trainer'}
            </strong>{' '}
            for your gym roster. Enter the agreed monthly compensation below.
          </p>

          <Input
            label="Agreed Monthly Salary (BDT ৳) *"
            type="number"
            min="0"
            step="any"
            value={hireSalary}
            onChange={(e) => setHireSalary(e.target.value)}
            placeholder="e.g. 30000"
            helperText="This amount will be used to automatically record monthly pending payouts."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApprovingApp(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={approveMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Hire & Save Salary
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

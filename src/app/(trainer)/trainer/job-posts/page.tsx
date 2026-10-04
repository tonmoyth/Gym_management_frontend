'use strict';
'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostApi } from '@/lib/api/jobPost.api';
import { trainerApi } from '@/lib/api/trainer.api';
import { Button } from '@/components/ui/Button';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  FileCheck,
  Banknote,
  Award,
  Eye,
  Search,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { JobPost } from '@/types/api.types';

export default function TrainerJobPostsPage() {
  const queryClient = useQueryClient();
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch own profile to check rules
  const { data: profileRes } = useQuery({
    queryKey: ['trainer-profile-me'],
    queryFn: () => trainerApi.getOwnProfile(),
  });

  const profile = profileRes?.data?.data;
  const completionPercent = profile?.profileCompletionPercent || 0;
  const isVerified = profile?.verifiedBadge || false;
  const isEligible = isVerified && completionPercent >= 100;

  // 2. Fetch open job posts
  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['open-job-posts'],
    queryFn: () => jobPostApi.getOpenPosts(),
  });

  const jobs: JobPost[] = jobsRes?.data?.data || [];

  // Filter jobs based on search term
  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter((job: any) => {
      const title = (job.title || '').toLowerCase();
      const gymName = (job.business?.name || '').toLowerCase();
      const spec = (job.specialization?.name || job.specializationTag?.name || '').toLowerCase();
      const desc = (job.description || '').toLowerCase();
      return title.includes(term) || gymName.includes(term) || spec.includes(term) || desc.includes(term);
    });
  }, [jobs, searchTerm]);

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: (jobId: string) => jobPostApi.apply(jobId),
    onSuccess: () => {
      setApplyingJobId(null);
      setSelectedJob(null);
      setSuccessMessage('Application submitted successfully! Track status in My Applications.');
      setTimeout(() => setSuccessMessage(null), 5000);
      queryClient.invalidateQueries({ queryKey: ['open-job-posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to submit application.');
      setApplyingJobId(null);
    }
  });

  const handleApply = (jobId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setApplyingJobId(jobId);
    applyMutation.mutate(jobId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h1 className="text-3xl font-black text-white tracking-tight">Gym Coaching Opportunities</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Browse verified gym facilities seeking certified personal trainers and class instructors.
          </p>
        </div>
        <Link href="/trainer/applications">
          <Button variant="outline" leftIcon={<FileCheck className="w-4 h-4" />}>
            My Applications
          </Button>
        </Link>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Qualifications Notice */}
      {!isEligible && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Application Eligibility Requirement: You must have <strong>100% profile completion</strong> (currently {completionPercent}%) and a <strong>Verified Badge</strong> (at least 1 admin-verified certificate) to apply for gym jobs.
            </span>
          </div>
          <Link href="/trainer/profile">
            <Button size="sm" variant="outline" className="text-xs text-amber-300 border-amber-500/30 shrink-0">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title, gym, or specialization..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2 self-center sm:self-auto">
          <Briefcase className="w-4 h-4 text-teal-400" />
          <span>Showing <strong>{filteredJobs.length}</strong> open positions</span>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchTerm ? "No Matching Positions Found" : "No Open Job Listings"}
          description={searchTerm ? "Try searching with different keywords." : "Gyms regularly publish vacancies for coaches. Check back soon for new openings."}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job: any) => {
            const businessName = job.business?.name || 'Verified Fitness Club';
            const location = job.business?.address || 'Location on file';
            const specializationName = job.specialization?.name || job.specializationTag?.name || 'General Fitness';
            const isApplying = applyMutation.isPending && applyingJobId === job.id;
            const salaryNumber = job.salary ? Number(job.salary) : 0;
            const hasSalary = salaryNumber > 0;
            const experienceYears = job.experience ?? 0;

            return (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  {/* Category and Facility */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {specializationName}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title & Gym */}
                  <h3 className="text-xl font-black text-white tracking-tight hover:text-teal-300 transition-colors">
                    {job.title}
                  </h3>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{businessName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="line-clamp-1">{location}</span>
                    </div>
                  </div>

                  {/* Salary & Experience Badges */}
                  <div className="flex flex-wrap items-center gap-2 my-4 pt-3 border-t border-slate-800/80">
                    {/* Salary Highlight */}
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        {hasSalary ? `৳${salaryNumber.toLocaleString()} / mo` : 'Salary Negotiable'}
                      </span>
                    </div>

                    {/* Experience Highlight */}
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-xs flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {experienceYears > 0 ? `${experienceYears}+ Yrs Exp` : 'Open to All Exp'}
                      </span>
                    </div>
                  </div>

                  {/* Short description preview */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-6">
                    {job.description}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    View Details
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApply(job.id)}
                    isLoading={isApplying}
                    disabled={!isEligible || isApplying}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className={`flex-1 text-xs ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {!isEligible ? 'Apply (Not Eligible)' : 'Apply Now'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Job Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title="Job Details & Compensation"
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Header with Title and Tags */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {selectedJob.specialization?.name || selectedJob.specializationTag?.name || 'General Fitness'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Posted on {new Date(selectedJob.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{selectedJob.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">{selectedJob.business?.name || 'Verified Fitness Club'}</span>
                <span className="text-slate-600">•</span>
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400">{selectedJob.business?.address || 'Location on file'}</span>
              </div>
            </div>

            {/* Compensation & Experience Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Salary Card */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                    Offered Monthly Salary
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {selectedJob.salary && Number(selectedJob.salary) > 0
                      ? `৳${Number(selectedJob.salary).toLocaleString()} / mo`
                      : 'Salary Negotiable'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Fixed monthly disbursement by gym owner
                  </div>
                </div>
              </div>

              {/* Experience Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-amber-400 font-medium uppercase tracking-wider">
                    Experience Required
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {selectedJob.experience && Number(selectedJob.experience) > 0
                      ? `${selectedJob.experience} Years Minimum`
                      : 'Open to All Levels'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Coaching & client training background
                  </div>
                </div>
              </div>
            </div>

            {/* Full Job Description */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Role & Requirements
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedJob.description}
              </div>
            </div>

            {/* Eligibility Check Status */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                {isEligible ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <span className={isEligible ? 'text-emerald-300' : 'text-amber-300'}>
                  {isEligible
                    ? 'Your trainer profile meets all requirements (100% complete & verified).'
                    : `Ineligible: 100% profile completion (${completionPercent}%) and a verified certificate are required.`}
                </span>
              </div>
              {!isEligible && (
                <Link href="/trainer/profile">
                  <Button size="sm" variant="outline" className="text-xs text-amber-300 border-amber-500/30">
                    Fix Profile
                  </Button>
                </Link>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setSelectedJob(null)}
                className="border-slate-700 text-slate-300"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleApply(selectedJob.id)}
                isLoading={applyMutation.isPending && applyingJobId === selectedJob.id}
                disabled={!isEligible || (applyMutation.isPending && applyingJobId === selectedJob.id)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isEligible ? 'Submit Application Now' : 'Cannot Apply (Requirements Incomplete)'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

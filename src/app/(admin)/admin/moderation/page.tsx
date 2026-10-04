'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  FileWarning, 
  Trash2, 
  Star, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  User,
  AlertCircle,
  Ban,
  Search,
  Users,
  Calendar
} from 'lucide-react';
import { Review, JobPost } from '@/types/api.types';

export default function AdminModerationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'reviews' | 'jobs'>('reviews');

  const [jobStatusFilter, setJobStatusFilter] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch Flagged Reviews
  const { data: reviewsRes, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['admin-flagged-reviews'],
    queryFn: () => adminApi.getFlaggedReviews(),
    enabled: activeTab === 'reviews',
  });

  const reviews = reviewsRes?.data?.data || [];

  // 2. Fetch Job Posts for Moderation
  const { data: jobsRes, isLoading: isJobsLoading } = useQuery({
    queryKey: ['admin-moderation-jobs', jobStatusFilter, jobSearch],
    queryFn: () =>
      adminApi.getJobPostsForModeration({
        isOpen: jobStatusFilter || undefined,
        search: jobSearch || undefined,
      }),
    enabled: activeTab === 'jobs',
  });

  const jobPosts = (jobsRes?.data?.data as any) || [];

  // Delete Review Mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      setSuccessMessage('Review removed from platform.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin-flagged-reviews'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to remove review.');
    },
  });

  // Remove Job Post Mutation (Takedown / Soft Close)
  const removeJobMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeJobPost(id),
    onSuccess: () => {
      setSuccessMessage('Job listing taken down successfully.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin-moderation-jobs'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to take down job listing.');
    },
  });

  // Delete Job Post Mutation (Permanent Purge)
  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteJobPost(id),
    onSuccess: () => {
      setSuccessMessage('Job listing deleted permanently.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin-moderation-jobs'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to delete job listing.');
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Platform Content Moderation</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Audit reported user feedback, toxic reviews, and deceptive trainer recruitment vacancies.
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => {
            setActiveTab('reviews');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`pb-3 px-5 text-sm font-bold transition-all relative ${
            activeTab === 'reviews'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>Flagged Reviews ({reviews.length})</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('jobs');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`pb-3 px-5 text-sm font-bold transition-all relative ${
            activeTab === 'jobs'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Job Posts Audit ({jobPosts.length})</span>
          </div>
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          {isReviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Flagged Reviews"
              description="Member testimonials comply with community guidelines. No offensive reviews reported."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev: Review) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-rose-400 font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                        Reported
                      </span>
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed mb-4">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteReviewMutation.mutate(rev.id)}
                      isLoading={
                        deleteReviewMutation.isPending &&
                        deleteReviewMutation.variables === rev.id
                      }
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                      className="text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      Remove Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Posts Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search job listings by title or description..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-500" />}
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Listings' },
                  { value: 'true', label: 'Active Listings Only' },
                  { value: 'false', label: 'Taken Down Only' },
                ]}
              />
            </div>
          </div>

          {/* Job Posts Grid */}
          {isJobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : jobPosts.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Job Listings Found"
              description="No recruitment posts match your filter criteria or all listings are compliant."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobPosts.map((job: any) => {
                const isActive = job.isOpen !== false;

                return (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Badges */}
                      <div className="flex items-center justify-between gap-2">
                        {job.specializationTag?.name ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                            {job.specializationTag.name}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                            General Fitness
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {isActive ? 'Active Listing' : 'Taken Down / Closed'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white">{job.title}</h3>

                      {/* Meta Information */}
                      <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-slate-800/80 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{job.business?.name || 'Affiliated Gym'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{job.applicationsCount || 0} Applicants</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        {!isActive && (
                          <span className="text-xs text-slate-500 font-medium px-2 py-1 rounded bg-slate-800/40 border border-slate-700/50">
                            Moderated
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeJobMutation.mutate(job.id)}
                            isLoading={
                              removeJobMutation.isPending &&
                              removeJobMutation.variables === job.id
                            }
                            leftIcon={<Ban className="w-3.5 h-3.5 text-amber-400" />}
                            className="text-xs text-amber-400 hover:bg-amber-500/10 border-amber-500/30"
                          >
                            Takedown Job Listing
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteJobMutation.mutate(job.id)}
                            isLoading={
                              deleteJobMutation.isPending &&
                              deleteJobMutation.variables === job.id
                            }
                            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                            className="text-xs text-rose-400 hover:bg-rose-500/10"
                          >
                            Delete Permanently
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

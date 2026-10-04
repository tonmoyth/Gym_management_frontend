'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { jobPostApi } from '@/lib/api/jobPost.api';
import { specializationTagApi } from '@/lib/api/specializationTag.api';
import { SpecializationTag } from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';
import { 
  Briefcase, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Tag,
  Check,
  X,
  Search,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerJobPostsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [closingJobId, setClosingJobId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specializationTagId, setSpecializationTagId] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('0');

  // Tag Search & Inline Creation State
  const [tagSearch, setTagSearch] = useState('');
  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // 1. Fetch current owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch gym job posts
  const { data: jobsRes, isLoading: isJobsLoading } = useQuery({
    queryKey: ['owner-job-posts', businessId],
    queryFn: () => jobPostApi.getMyPosts({ limit: 50 }),
  });

  // 3. Fetch all specialization tags via GET API
  const { data: tagsRes, isLoading: isTagsLoading } = useQuery({
    queryKey: ['specialization-tags'],
    queryFn: () => specializationTagApi.getAll(),
  });

  const specializationTags: SpecializationTag[] = tagsRes?.data?.data || [];

  // Filter jobs belonging to this business if returned
  const allJobs = jobsRes?.data?.data || [];
  const gymJobs = allJobs.filter((j: any) => !businessId || !j.business?.id || j.business?.id === businessId);

  // Create Tag Mutation
  const createTagMutation = useMutation({
    mutationFn: (name: string) => specializationTagApi.create(name),
    onSuccess: (res) => {
      const createdTag = res?.data?.data;
      if (createdTag?.id) {
        setSpecializationTagId(createdTag.id);
      }
      queryClient.invalidateQueries({ queryKey: ['specialization-tags'] });
      setNewTagName('');
      setIsCreatingNewTag(false);
      setTagSearch('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create specialization tag.');
    }
  });

  // Create Job Post Mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      specializationTagId: string;
      salary?: number;
      experience?: number;
    }) => jobPostApi.create(data),
    onSuccess: () => {
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setSpecializationTagId('');
      setSalary('');
      setExperience('0');
      setTagSearch('');
      setIsCreatingNewTag(false);
      queryClient.invalidateQueries({ queryKey: ['owner-job-posts'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create job post.');
    }
  });

  // Close Job Mutation
  const closeMutation = useMutation({
    mutationFn: (id: string) => jobPostApi.close(id),
    onSuccess: () => {
      setClosingJobId(null);
      queryClient.invalidateQueries({ queryKey: ['owner-job-posts'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to close job post.');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!specializationTagId) {
      setErrorMessage('Please select or create a specialization discipline.');
      return;
    }

    createMutation.mutate({
      title,
      description,
      specializationTagId,
      salary: salary ? parseFloat(salary) : undefined,
      experience: experience ? parseInt(experience, 10) : 0,
    });
  };

  const handleCreateNewTag = () => {
    const nameToCreate = (newTagName || tagSearch).trim();
    if (!nameToCreate) return;
    createTagMutation.mutate(nameToCreate);
  };

  const filteredTags = specializationTags.filter((t) =>
    (t.name || '').toLowerCase().includes(tagSearch.toLowerCase())
  );
  const selectedTag = specializationTags.find((t) => t.id === specializationTagId);
  const hasExactMatch = specializationTags.some(
    (t) => t.name.toLowerCase() === (tagSearch || newTagName).trim().toLowerCase()
  );

  if (isBusinessLoading || isJobsLoading) {
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
          <h1 className="text-3xl font-black text-white tracking-tight">Trainer Job Postings</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Recruit certified fitness coaches and personal trainers to grow your gym's roster.
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorMessage(null);
            setIsCreateOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="rounded-xl shadow-lg shadow-blue-600/20"
        >
          Post New Job
        </Button>
      </div>

      {gymJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Active Job Listings"
          description="Create a job vacancy for fitness coaches, strength instructors, or yoga trainers."
          actionLabel="Post a Trainer Job"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gymJobs.map((job: any) => {
            const isOpen = job.isOpen;
            return (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isOpen 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isOpen ? 'Open for Applications' : 'Closed'}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">{job.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 mb-4">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 py-3 border-y border-slate-800/80 my-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>

                    {(job.specializationTag?.name || job.specialization?.name) && (
                      <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-medium">
                        {job.specializationTag?.name || job.specialization?.name}
                      </span>
                    )}

                    {job.salary && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">
                        ৳{Number(job.salary).toLocaleString()}/mo
                      </span>
                    )}

                    {job.experience !== undefined && job.experience !== null && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 font-medium">
                        {Number(job.experience) > 0 ? `${job.experience}+ Yrs Exp` : 'Any Exp'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/owner/job-posts/${job.id}/applicants`}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<Users className="w-3.5 h-3.5" />}
                      className="w-full text-xs"
                    >
                      Review Applicants{job.applicantCount ? ` (${job.applicantCount})` : ''}
                    </Button>
                  </Link>

                  {isOpen && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setClosingJobId(job.id)}
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      Close Job
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Job Modal with Creatable Specialization Selector */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Post a Trainer Job Opening"
        description="Specify the vacancy title, coaching specialization, and key duties."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Job Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lead Strength & Conditioning Coach"
            required
          />

          {/* Dynamic Specialization Selector / Creator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Specialization Discipline *
              </label>
              {!isCreatingNewTag && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNewTag(true);
                    setNewTagName(tagSearch);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> New Specialization
                </button>
              )}
            </div>

            {/* Currently Selected Tag Banner */}
            {selectedTag && (
              <div className="flex items-center justify-between p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-300">Selected Discipline:</span>
                  <span className="text-xs font-bold text-white bg-blue-600 px-2.5 py-0.5 rounded-lg shadow-xs">
                    {selectedTag.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSpecializationTagId('')}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Change specialization"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Inline Custom Tag Creation Input */}
            {isCreatingNewTag ? (
              <div className="p-3 bg-slate-800/80 border border-blue-500/30 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Create Custom Specialization
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewTag(false);
                      setNewTagName('');
                    }}
                    className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. CrossFit, Pilates, Kickboxing..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-9 text-xs"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleCreateNewTag}
                    isLoading={createTagMutation.isPending}
                    disabled={!newTagName.trim()}
                    className="shrink-0 text-xs font-bold"
                  >
                    Add & Select
                  </Button>
                </div>
              </div>
            ) : (
              /* Tag Search & Pill Grid */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search or filter specializations..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>

                {isTagsLoading ? (
                  <div className="flex gap-2 py-2">
                    <div className="h-7 w-20 bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-7 w-24 bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-7 w-16 bg-slate-800 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 py-1">
                      {filteredTags.map((tag) => {
                        const isSelected = specializationTagId === tag.id;
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => setSpecializationTagId(tag.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer",
                              isSelected
                                ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                                : "bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60"
                            )}
                          >
                            <Tag className="w-3 h-3 opacity-60" />
                            <span>{tag.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                          </button>
                        );
                      })}

                      {filteredTags.length === 0 && (
                        <p className="text-xs text-slate-500 py-1">No matching specializations found.</p>
                      )}
                    </div>

                    {/* Quick Add Prompt if search query doesn't match any tag */}
                    {tagSearch.trim() && !hasExactMatch && (
                      <button
                        type="button"
                        onClick={() => createTagMutation.mutate(tagSearch.trim())}
                        disabled={createTagMutation.isPending}
                        className="w-full text-left p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-blue-400" />
                          <span>Create <strong>"{tagSearch.trim()}"</strong> and select</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-600/30 px-1.5 py-0.5 rounded text-blue-300">
                          Add New
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!specializationTagId && (
              <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Please select or create a specialization discipline.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Offered Monthly Salary (BDT ৳)"
              type="number"
              min="0"
              placeholder="e.g. 30000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
            <Input
              label="Min. Experience (Years)"
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          <Textarea
            label="Job Description & Responsibilities *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe class types, expected hours, member coaching expectations, and facility perks..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              disabled={!specializationTagId}
            >
              Publish Job Post
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!closingJobId}
        onClose={() => setClosingJobId(null)}
        onConfirm={() => closingJobId && closeMutation.mutate(closingJobId)}
        title="Close this Job Posting?"
        description="Closing this job will prevent new trainers from submitting applications. Existing pending applicants can still be reviewed."
        confirmLabel="Close Listing"
        variant="danger"
        isLoading={closeMutation.isPending}
      />
    </div>
  );
}

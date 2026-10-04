'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, SystemAnnouncement } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import {
  Megaphone,
  Plus,
  Send,
  Users,
  Building2,
  Award,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Search,
  Filter
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'BUSINESS_OWNER' | 'TRAINER' | 'MEMBER'>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'BUSINESS_OWNER' | 'TRAINER' | 'MEMBER'>('ALL');

  // Fetch Announcements
  const { data: announcementsRes, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => adminApi.getAnnouncements(),
  });

  const rawList: SystemAnnouncement[] = announcementsRes?.data?.data || [];

  // Filtered List
  const filteredList = rawList.filter((item) => {
    const matchesAudience =
      audienceFilter === 'ALL' || item.targetRole === (audienceFilter as string) || !item.targetRole;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAudience && matchesSearch;
  });

  // Calculate Metrics
  const totalAnnouncements = rawList.length;
  const totalRecipients = rawList.reduce((acc, curr) => acc + (curr.recipientCount || 0), 0);

  // Create Announcement Mutation
  const createMutation = useMutation({
    mutationFn: (data: { title: string; body: string; targetRole?: string }) =>
      adminApi.createAnnouncement(data),
    onSuccess: (res) => {
      setIsCreateOpen(false);
      setTitle('');
      setBody('');
      setTargetRole('ALL');
      setErrorMessage(null);
      setSuccessMessage('Announcement broadcasted successfully to targeted recipients.');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch announcement.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMessage('Please fill in both title and announcement message.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    createMutation.mutate({
      title: title.trim(),
      body: body.trim(),
      targetRole: targetRole === 'ALL' ? undefined : targetRole,
    });
  };

  const getAudienceBadge = (role?: string) => {
    switch (role) {
      case 'BUSINESS_OWNER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Building2 className="w-3 h-3" />
            Gym Owners
          </span>
        );
      case 'TRAINER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Award className="w-3 h-3" />
            Trainers
          </span>
        );
      case 'MEMBER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Users className="w-3 h-3" />
            Members
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Radio className="w-3 h-3" />
            All Platform Users
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>System Announcements</span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-600/20 text-purple-400 border border-purple-500/30">
              Broadcast
            </span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Publish platform-wide announcements and push urgent notices to gym owners, coaches, and members.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setSuccessMessage(null);
            setIsCreateOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Announcement
        </Button>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400/80 hover:text-rose-200 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400/80 hover:text-emerald-200 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Dispatched</p>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{totalAnnouncements}</p>
          <p className="text-xs text-slate-500 mt-1">Platform-wide broadcasts</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications Delivered</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-3">{totalRecipients}</p>
          <p className="text-xs text-slate-500 mt-1">Total in-app notification alerts</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Audience Scope</p>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-black text-white mt-3">Owners, Trainers, Members</p>
          <p className="text-xs text-slate-500 mt-1">Targeted role channels</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcement history..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setAudienceFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              audienceFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setAudienceFilter('BUSINESS_OWNER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              audienceFilter === 'BUSINESS_OWNER'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Gym Owners
          </button>
          <button
            onClick={() => setAudienceFilter('TRAINER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              audienceFilter === 'TRAINER'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Trainers
          </button>
          <button
            onClick={() => setAudienceFilter('MEMBER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              audienceFilter === 'MEMBER'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Members
          </button>
        </div>
      </div>

      {/* Announcements Feed / List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Announcements Dispatched"
          description={
            searchQuery || audienceFilter !== 'ALL'
              ? 'No announcements found matching the selected filter criteria.'
              : 'Keep all platform participants informed about scheduled maintenance, policy updates, and releases.'
          }
          actionLabel="Broadcast Announcement"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">{item.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>By {item.createdBy || 'Super Admin'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getAudienceBadge(item.targetRole)}
                  {item.recipientCount !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                      <Users className="w-3 h-3 text-slate-400" />
                      {item.recipientCount} delivered
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-12">
                {item.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Broadcast System Announcement"
        description="This message will be instantly delivered as an in-app alert to all users within the selected audience."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Announcement Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled Platform Maintenance & Database Upgrade"
            required
          />

          <Select
            label="Target Audience *"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as any)}
            options={[
              { value: 'ALL', label: 'All Platform Users (Owners, Trainers, Members)' },
              { value: 'BUSINESS_OWNER', label: 'Gym Business Owners Only' },
              { value: 'TRAINER', label: 'Personal Trainers Only' },
              { value: 'MEMBER', label: 'Gym Members Only' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Message Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Write the detailed announcement message or instructions here..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 flex justify-between">
              <span>Recipients will see this in their notification center.</span>
              <span>{body.length} characters</span>
            </p>
          </div>

          {/* Live Preview Card */}
          {title.trim() && (
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                  Notification Preview
                </span>
                {getAudienceBadge(targetRole)}
              </div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-slate-400 line-clamp-2">
                {body.trim() || 'Your message will appear here...'}
              </p>
            </div>
          )}

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
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
